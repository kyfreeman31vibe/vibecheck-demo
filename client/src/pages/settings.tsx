import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Bell, Shield, CreditCard, Save, Eye, EyeOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/bottom-navigation";

interface SettingsProps {
  currentUser: any;
}

export default function Settings({ currentUser }: SettingsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Account settings state
  const [accountData, setAccountData] = useState({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    address: currentUser?.address || "",
    birthday: currentUser?.birthday || "",
    phone: currentUser?.phone || "",
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    likes: true,
    events: false,
    marketing: false,
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    profileVisibility: "everyone", // everyone, matches-only, hidden
    ageVisibility: true,
    locationVisibility: true,
    lastSeenVisibility: true,
    readReceipts: true,
    onlineStatus: true,
    discoverable: true,
    showDistance: true,
    allowMessages: "matches", // everyone, matches, verified
  });

  // Billing settings state
  const [billing, setBilling] = useState({
    plan: "free", // free, premium, plus
    autoRenew: true,
    paymentMethod: "",
  });

  const updateAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/users/${currentUser.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account updated",
        description: "Your account information has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update account information.",
        variant: "destructive",
      });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/users/${currentUser.id}/notifications`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    },
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/users/${currentUser.id}/privacy`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update privacy settings.",
        variant: "destructive",
      });
    },
  });

  const handleAccountSave = () => {
    updateAccountMutation.mutate(accountData);
  };

  const handleNotificationsSave = () => {
    updateNotificationsMutation.mutate(notifications);
  };

  const handlePrivacySave = () => {
    updatePrivacyMutation.mutate(privacy);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/profile")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your preferences</p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account" className="text-xs">
              <User className="w-4 h-4 mr-1" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">
              <Bell className="w-4 h-4 mr-1" />
              Notify
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs">
              <Shield className="w-4 h-4 mr-1" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="billing" className="text-xs">
              <CreditCard className="w-4 h-4 mr-1" />
              Billing
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={accountData.name}
                      onChange={(e) => setAccountData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={accountData.username}
                      onChange={(e) => setAccountData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={accountData.phone}
                    onChange={(e) => setAccountData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={accountData.birthday}
                    onChange={(e) => setAccountData(prev => ({ ...prev, birthday: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Only visible to you</p>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={accountData.address}
                    onChange={(e) => setAccountData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="City, State/Country"
                  />
                  <p className="text-xs text-gray-500 mt-1">Only visible to you</p>
                </div>

                <Button 
                  onClick={handleAccountSave}
                  disabled={updateAccountMutation.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateAccountMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">App Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-matches">New matches</Label>
                      <Switch
                        id="new-matches"
                        checked={notifications.newMatches}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newMatches: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="messages">Messages</Label>
                      <Switch
                        id="messages"
                        checked={notifications.messages}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, messages: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="likes">Likes & Super Likes</Label>
                      <Switch
                        id="likes"
                        checked={notifications.likes}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, likes: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="events">Events & Concerts</Label>
                      <Switch
                        id="events"
                        checked={notifications.events}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, events: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Communication Channels</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push">Push Notifications</Label>
                      <Switch
                        id="push"
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email Notifications</Label>
                      <Switch
                        id="email"
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms">SMS Notifications</Label>
                      <Switch
                        id="sms"
                        checked={notifications.smsNotifications}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsNotifications: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Marketing</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketing">Promotional emails</Label>
                    <Switch
                      id="marketing"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleNotificationsSave}
                  disabled={updateNotificationsMutation.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Privacy & Safety</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Profile Visibility</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="profile-visibility">Who can see your profile</Label>
                      <Select
                        value={privacy.profileVisibility}
                        onValueChange={(value) => setPrivacy(prev => ({ ...prev, profileVisibility: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">Everyone</SelectItem>
                          <SelectItem value="matches-only">Matches only</SelectItem>
                          <SelectItem value="hidden">Hidden from discovery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="age-visibility">Show my age</Label>
                      <Switch
                        id="age-visibility"
                        checked={privacy.ageVisibility}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, ageVisibility: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="location-visibility">Show my location</Label>
                      <Switch
                        id="location-visibility"
                        checked={privacy.locationVisibility}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, locationVisibility: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="distance">Show distance</Label>
                      <Switch
                        id="distance"
                        checked={privacy.showDistance}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showDistance: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Activity & Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="online-status">Show when I'm online</Label>
                      <Switch
                        id="online-status"
                        checked={privacy.onlineStatus}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, onlineStatus: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="last-seen">Show last seen</Label>
                      <Switch
                        id="last-seen"
                        checked={privacy.lastSeenVisibility}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, lastSeenVisibility: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="read-receipts">Read receipts</Label>
                      <Switch
                        id="read-receipts"
                        checked={privacy.readReceipts}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, readReceipts: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Messages</h3>
                  <div>
                    <Label htmlFor="allow-messages">Who can message you</Label>
                    <Select
                      value={privacy.allowMessages}
                      onValueChange={(value) => setPrivacy(prev => ({ ...prev, allowMessages: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="everyone">Everyone</SelectItem>
                        <SelectItem value="matches">Matches only</SelectItem>
                        <SelectItem value="verified">Verified users only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Discovery</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="discoverable">Make me discoverable</Label>
                    <Switch
                      id="discoverable"
                      checked={privacy.discoverable}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, discoverable: checked }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handlePrivacySave}
                  disabled={updatePrivacyMutation.isPending}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updatePrivacyMutation.isPending ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Billing & Subscription</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Current Plan</h3>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium capitalize">{billing.plan} Plan</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {billing.plan === "free" ? "Basic features included" : 
                           billing.plan === "premium" ? "$9.99/month - All premium features" :
                           "$19.99/month - All features + exclusive perks"}
                        </p>
                      </div>
                      {billing.plan !== "premium" && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            setBilling(prev => ({ ...prev, plan: "premium" }));
                            toast({
                              title: "Plan Upgraded!",
                              description: "You now have premium features. Payment processing will be added soon.",
                            });
                          }}
                        >
                          Upgrade
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {billing.plan !== "free" && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-4">Billing Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-renew">Auto-renew subscription</Label>
                          <Switch
                            id="auto-renew"
                            checked={billing.autoRenew}
                            onCheckedChange={(checked) => setBilling(prev => ({ ...prev, autoRenew: checked }))}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />
                    <div>
                      <h3 className="font-medium mb-4">Payment Method</h3>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/26</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toast({
                              title: "Payment Update",
                              description: "Payment processing will be available soon!",
                            })}
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />
                    <div>
                      <h3 className="font-medium mb-4">Billing History</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Jan 2025 - Premium Plan</span>
                          <span>$9.99</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Dec 2024 - Premium Plan</span>
                          <span>$9.99</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => toast({
                          title: "Billing History",
                          description: "Full billing history will be available soon!",
                        })}
                      >
                        View All Invoices
                      </Button>
                    </div>
                  </>
                )}

                <Separator />
                <div>
                  <h3 className="font-medium mb-4">Plan Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Unlimited likes</span>
                      <span className={billing.plan !== "free" ? "text-green-600" : "text-gray-400"}>
                        {billing.plan !== "free" ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Super likes (5/day)</span>
                      <span className={billing.plan !== "free" ? "text-green-600" : "text-gray-400"}>
                        {billing.plan !== "free" ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>See who liked you</span>
                      <span className={billing.plan !== "free" ? "text-green-600" : "text-gray-400"}>
                        {billing.plan !== "free" ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Boost (1/month)</span>
                      <span className={billing.plan === "plus" ? "text-green-600" : "text-gray-400"}>
                        {billing.plan === "plus" ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                </div>

                {billing.plan !== "free" && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      setBilling(prev => ({ ...prev, plan: "free" }));
                      toast({
                        title: "Subscription Cancelled",
                        description: "Your subscription has been cancelled. You can resubscribe anytime.",
                      });
                    }}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation currentUser={currentUser} />
    </div>
  );
}