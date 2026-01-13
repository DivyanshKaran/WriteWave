import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useNotifications as useNotificationsHook, useMarkNotificationRead } from "@/hooks/useNotifications";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { useAuthStore } from "@/stores/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/lib/api-client";

export default function Notifications() {
  const userId = useAuthStore((s) => s.user?.id || (s.user as any)?.userId);
  const qc = useQueryClient();
  const { data, isLoading, error } = useNotificationsHook(userId || "");
  const markRead = useMarkNotificationRead();
  const { supported, subscribed, loading: subLoading, error: subError, subscribe, unsubscribe, checkSubscription } = usePushSubscription();

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const items = (data || []) as Array<any>;
  const unreadCount = items.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAuthenticated />
      
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2">Notifications</h1>
                <p className="text-lg text-muted-foreground">
                  {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : "You're all caught up!"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={!userId || items.length === 0}
                onClick={async () => {
                  if (!userId) return;
                  await notificationService.markAllAsRead(userId as any);
                  qc.invalidateQueries({ queryKey: ['notifications'] });
                }}
              >
                Mark all as read
              </Button>
              {supported && (
                subscribed ? (
                  <Button variant="ghost" size="sm" onClick={unsubscribe} disabled={subLoading}>
                    Disable Push
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={subscribe} disabled={subLoading}>
                    Enable Push
                  </Button>
                )
              )}
            </div>
          </div>

          {isLoading && <Card className="p-6">Loading...</Card>}
          {error && <div className="text-destructive">{(error as any)?.message || 'Failed to load notifications'}</div>}
          {subError && <div className="text-destructive mt-2">{subError}</div>}
          {!isLoading && !error && items.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No notifications yet</h3>
                <p className="text-muted-foreground">
                  We'll notify you when something important happens
                </p>
              </div>
            </Card>
          ) : (!isLoading && !error && (
            <div className="space-y-3">
              {items.map((notification: any) => {
                return (
                  <Card 
                    key={notification.id}
                    className={`transition-colors cursor-pointer ${
                      !notification.read ? 'border-accent bg-accent/5' : 'hover:border-accent'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full shrink-0 ${!notification.read ? 'bg-primary/10' : 'bg-secondary'}`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold">{notification.title || notification.type}</h3>
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await markRead.mutateAsync({ id: notification.id });
                                }}
                              >
                                Mark read
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message || notification.content}
                          </p>
                          {notification.createdAt && (
                            <p className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
