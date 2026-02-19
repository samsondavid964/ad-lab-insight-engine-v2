import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CalendarIcon, Hash, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLIENT_NAMES } from "@/lib/clients";

interface ReportFormProps {
  onSubmit: (data: { clientName: string; googleAdsId: string; startDate: string; endDate: string }) => void;
  isLoading: boolean;
}

const ReportForm = ({ onSubmit, isLoading }: ReportFormProps) => {
  const [clientName, setClientName] = useState("");
  const [googleAdsId, setGoogleAdsId] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !googleAdsId.trim() || !startDate || !endDate) return;
    onSubmit({
      clientName: clientName.trim(),
      googleAdsId: googleAdsId.trim(),
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    });
  };

  return (
    <Card className="border border-white/10 shadow-2xl bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="clientName" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              <Building2 className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Client Name
            </Label>
            <Select onValueChange={setClientName} value={clientName}>
              <SelectTrigger className="h-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {CLIENT_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleAdsId" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              <Hash className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Google Ads ID
            </Label>
            <Input
              id="googleAdsId"
              type="text"
              placeholder="e.g. 123-456-7890"
              value={googleAdsId}
              onChange={(e) => setGoogleAdsId(e.target.value)}
              className="h-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
              required
              maxLength={255}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                <CalendarIcon className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal border-slate-200 bg-slate-50 hover:bg-white rounded-xl transition-all",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM d, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                <CalendarIcon className="inline-block w-3.5 h-3.5 mr-1.5 -mt-0.5" />
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal border-slate-200 bg-slate-50 hover:bg-white rounded-xl transition-all",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM d, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !clientName.trim() || !googleAdsId.trim() || !startDate || !endDate}
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
