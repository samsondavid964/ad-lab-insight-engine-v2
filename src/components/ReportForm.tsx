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
    <Card className="border border-white/10 shadow-2xl bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              <Building2 className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Business Name
            </Label>
            <Input
              id="businessName"
              placeholder="e.g. Acme Corporation"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              <Globe className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://www.example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="h-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
              required
              maxLength={255}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                <Calendar className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                Start Month
              </Label>
              <Input
                id="startDate"
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                <Calendar className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                End Month
              </Label>
              <Input
                id="endDate"
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !businessName.trim() || !websiteUrl.trim() || !startDate || !endDate}
            className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
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
