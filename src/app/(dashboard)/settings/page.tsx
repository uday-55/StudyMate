import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account and app settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center h-[50vh] bg-muted/30 dark:bg-muted/50 rounded-lg border-2 border-dashed">
          <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold">Settings Page Coming Soon!</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            We're working on giving you more control over your experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
