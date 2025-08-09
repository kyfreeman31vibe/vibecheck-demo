import { Request, Response } from 'express';

const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY || 'QJXKRYL4aGT1Tu2Lm2UaCSsllCdHThRS';
const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;

interface Event {
  id: string;
  name: string;
  description?: string;
  date: string;
  time: string;
  venue: {
    name: string;
    city: string;
    state?: string;
    country: string;
    address?: string;
  };
  price: {
    min?: number;
    max?: number;
    currency: string;
  };
  image?: string;
  url: string;
  source: 'ticketmaster' | 'eventbrite' | 'stubhub';
  genres: string[];
}

export class EventsService {
  private static async fetchTicketmasterEvents(
    location: string, 
    genres: string[] = [],
    radius = 25
  ): Promise<Event[]> {
    if (!TICKETMASTER_API_KEY) {
      throw new Error('Ticketmaster API key not configured');
    }

    // Try multiple search strategies
    const searchStrategies = [
      // 1. Search by city with specified radius
      {
        city: location,
        radius: radius.toString(),
        unit: 'miles'
      },
      // 2. Fallback: Search by broader area (larger radius)
      {
        city: location,
        radius: '100',
        unit: 'miles'
      },
      // 3. Fallback: Search by country only if location fails
      {
        countryCode: 'US'
      }
    ];

    for (const strategy of searchStrategies) {
      try {
        const params = new URLSearchParams({
          apikey: TICKETMASTER_API_KEY,
          classificationName: 'music',
          size: '50',
          sort: 'date,asc'
        });

        // Add strategy-specific parameters
        Object.entries(strategy).forEach(([key, value]) => {
          params.append(key, value);
        });

        if (genres.length > 0) {
          params.append('keyword', genres.join(' OR '));
        }

        const response = await fetch(
          `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`
        );

        if (!response.ok) {
          continue; // Try next strategy
        }

        const data = await response.json();
        
        if (data._embedded?.events && data._embedded.events.length > 0) {
          // Found events with this strategy, return them
          return data._embedded.events.map((event: any) => ({
            id: event.id,
            name: event.name,
            description: event.info || event.pleaseNote,
            date: event.dates.start.localDate,
            time: event.dates.start.localTime || '19:00',
            venue: {
              name: event._embedded?.venues?.[0]?.name || 'TBA',
              city: event._embedded?.venues?.[0]?.city?.name || location,
              state: event._embedded?.venues?.[0]?.state?.stateCode,
              country: event._embedded?.venues?.[0]?.country?.countryCode || 'US',
              address: event._embedded?.venues?.[0]?.address?.line1
            },
            price: {
              min: event.priceRanges?.[0]?.min,
              max: event.priceRanges?.[0]?.max,
              currency: event.priceRanges?.[0]?.currency || 'USD'
            },
            image: event.images?.[0]?.url,
            url: event.url,
            source: 'ticketmaster' as const,
            genres: event.classifications?.map((c: any) => c.genre?.name).filter(Boolean) || []
          }));
        }
      } catch (error) {
        console.log(`Search strategy failed: ${JSON.stringify(strategy)}`, error);
        continue; // Try next strategy
      }
    }

    // No events found with any strategy
    return [];


  }

  private static async fetchEventbriteEvents(
    location: string,
    genres: string[] = []
  ): Promise<Event[]> {
    if (!EVENTBRITE_API_KEY) {
      throw new Error('Eventbrite API key not configured');
    }

    const params = new URLSearchParams({
      'location.address': location,
      'location.within': '25mi',
      'categories': '103', // Music category ID
      'sort_by': 'date',
      'expand': 'venue,ticket_availability'
    });

    if (genres.length > 0) {
      params.append('q', genres.join(' '));
    }

    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${EVENTBRITE_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.events) {
      return [];
    }

    return data.events.map((event: any) => ({
      id: event.id,
      name: event.name.text,
      description: event.description?.text?.substring(0, 200) + '...',
      date: event.start.local.split('T')[0],
      time: event.start.local.split('T')[1]?.substring(0, 5) || '19:00',
      venue: {
        name: event.venue?.name || 'TBA',
        city: event.venue?.address?.city || location,
        state: event.venue?.address?.region,
        country: event.venue?.address?.country || 'US',
        address: event.venue?.address?.address_1
      },
      price: {
        min: event.ticket_availability?.minimum_ticket_price?.major_value,
        max: event.ticket_availability?.maximum_ticket_price?.major_value,
        currency: event.ticket_availability?.minimum_ticket_price?.currency || 'USD'
      },
      image: event.logo?.url,
      url: event.url,
      source: 'eventbrite' as const,
      genres: [] // Eventbrite doesn't provide detailed genre info
    }));
  }

  static async searchEvents(
    location: string,
    userGenres: string[] = [],
    radius = 25
  ): Promise<Event[]> {
    const events: Event[] = [];

    try {
      // Fetch from Ticketmaster
      const ticketmasterEvents = await this.fetchTicketmasterEvents(location, userGenres, radius);
      events.push(...ticketmasterEvents);
    } catch (error) {
      console.error('Ticketmaster API error:', error);
    }

    try {
      // Fetch from Eventbrite
      const eventbriteEvents = await this.fetchEventbriteEvents(location, userGenres);
      events.push(...eventbriteEvents);
    } catch (error) {
      console.error('Eventbrite API error:', error);
    }

    // Sort by date and remove duplicates
    const uniqueEvents = events.filter((event, index, self) => 
      index === self.findIndex(e => e.name === event.name && e.date === event.date)
    );

    return uniqueEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Express route handler
  static getEvents = async (req: Request, res: Response) => {
    const { location, genres, radius } = req.query;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    try {
      const userGenres = genres ? (genres as string).split(',') : [];
      const searchRadius = radius ? parseInt(radius as string) : 25;
      
      const events = await this.searchEvents(
        location as string,
        userGenres,
        searchRadius
      );

      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  };
}