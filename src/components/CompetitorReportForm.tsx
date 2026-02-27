import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Building2, ArrowRight } from "lucide-react";
import { CLIENT_NAMES } from "@/lib/clients";

interface CompetitorReportFormProps {
    onSubmit: (data: { clientName: string }) => void;
    isLoading: boolean;
    onBack?: () => void;
}

const CompetitorReportForm = ({ onSubmit, isLoading, onBack }: CompetitorReportFormProps) => {
    const [clientName, setClientName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName.trim()) return;
        onSubmit({ clientName: clientName.trim() });
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
                            <SelectTrigger className="h-12 text-base border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-brand-500/20 rounded-xl transition-all">
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

                    <div className="flex flex-col gap-3">
                        <Button
                            type="submit"
                            disabled={isLoading || !clientName.trim()}
                            className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white"
                        >
                            Generate Report
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        {onBack && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onBack}
                                disabled={isLoading}
                                className="w-full h-14 text-lg font-semibold rounded-xl text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50 transition-all duration-300"
                            >
                                Back to Options
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default CompetitorReportForm;
