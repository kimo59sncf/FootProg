import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fr, enUS } from "date-fns/locale";

export type MatchFilterValues = {
  location?: string;
  date?: Date;
  fieldType?: string;
  spotsAvailable?: string;
};

interface MatchFilterProps {
  onFilter: (values: MatchFilterValues) => void;
  isLoading?: boolean;
}

export function MatchFilter({ onFilter, isLoading = false }: MatchFilterProps) {
  const { t, i18n } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dateLocale = i18n.language === 'fr' ? fr : enUS;

  const formSchema = z.object({
    location: z.string().optional(),
    date: z.date().optional(),
    fieldType: z.string().optional(),
    spotsAvailable: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      fieldType: "",
      spotsAvailable: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onFilter(values);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("filter.location")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder={t("filter.locationPlaceholder")} 
                        {...field} 
                      />
                      <MapPin className="absolute right-3 top-2.5 text-gray-400 h-4 w-4" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("filter.date")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: dateLocale })
                          ) : (
                            <span>{t("filter.selectDate")}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        locale={dateLocale}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fieldType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("filter.fieldType")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("filter.allFields")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">{t("filter.allFields")}</SelectItem>
                      <SelectItem value="free">{t("filter.freeField")}</SelectItem>
                      <SelectItem value="paid">{t("filter.paidField")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spotsAvailable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("filter.availableSpots")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("filter.any")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">{t("filter.any")}</SelectItem>
                      <SelectItem value="1">{t("filter.atLeast", { count: 1 })}</SelectItem>
                      <SelectItem value="2">{t("filter.atLeast", { count: 2 })}</SelectItem>
                      <SelectItem value="5">{t("filter.atLeast", { count: 5 })}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="flex items-end">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                <Search className="mr-2 h-4 w-4" />
                {t("filter.search")}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-primary text-sm flex items-center"
            >
              {showAdvanced ? (
                <>
                  {t("filter.lessFilters")}
                  <ChevronUp className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  {t("filter.moreFilters")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Additional filters could be added here */}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

// Import these from lucide-react but include them directly to avoid circular imports
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

function MapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
