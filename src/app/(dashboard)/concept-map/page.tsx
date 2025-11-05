import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function ConceptMapPage() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Concept Map</CardTitle>
        <CardDescription>
          Visualize the relationships between topics in your document.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center h-[50vh] bg-muted/30 dark:bg-muted/50 rounded-lg border-2 border-dashed">
          <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold">Feature Coming Soon!</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            We're working hard to bring you interactive concept maps. This feature will help you explore the connections in your study material like never before.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
