import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Globe, Building2, ArrowRight } from "lucide-react";

interface ReportFormProps {
  onSubmit: (data: { businessName: string; websiteUrl: string; startDate: string; endDate: string }) => void;
  isLoading: boolean;
}

const ReportForm = ({ onSubmit, isLoading }: ReportFormProps) => {
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !websiteUrl.trim() || !startDate || !endDate) return;
    onSubmit({ businessName: businessName.trim(), websiteUrl: websiteUrl.trim(), startDate, endDate });
  };

  return (
    <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Building2 className="inline-block w-4 h-4 mr-2 -mt-0.5" />
              Business Name
            </Label>
            <Input
              id="businessName"
              placeholder="e.g. Acme Corporation"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-12 text-base bg-background border-border/50 focus:border-accent"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Globe className="inline-block w-4 h-4 mr-2 -mt-0.5" />
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://www.example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="h-12 text-base bg-background border-border/50 focus:border-accent"
              required
              maxLength={255}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Calendar className="inline-block w-4 h-4 mr-2 -mt-0.5" />
                Start Month
              </Label>
              <Input
                id="startDate"
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-12 text-base bg-background border-border/50 focus:border-accent"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Calendar className="inline-block w-4 h-4 mr-2 -mt-0.5" />
                End Month
              </Label>
              <Input
                id="endDate"
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12 text-base bg-background border-border/50 focus:border-accent"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !businessName.trim() || !websiteUrl.trim() || !startDate || !endDate}
            className="w-full h-14 text-lg font-semibold bg-accent hover:bg-blue-glow text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Generate Report
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportForm;
