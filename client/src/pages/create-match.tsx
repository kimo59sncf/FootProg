import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { MapView } from "@/components/ui/map-view";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Map, Plus, Info } from "lucide-react";

export default function CreateMatch() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const dateLocale = i18n.language === 'fr' ? fr : enUS;
  const [showComplexInfo, setShowComplexInfo] = useState(false);

  const formSchema = z.object({
    title: z.string().min(5, t("createMatch.validation.titleRequired")),
    fieldType: z.enum(["free", "paid"], {
      required_error: t("createMatch.validation.fieldTypeRequired"),
    }),
    date: z.date({
      required_error: t("createMatch.validation.dateRequired"),
    }),
    time: z.string().min(1, t("createMatch.validation.timeRequired")),
    duration: z.coerce.number().min(30, t("createMatch.validation.durationMin")).max(240, t("createMatch.validation.durationMax")),
    playersNeeded: z.coerce.number().min(1, t("createMatch.validation.playersMin")).max(22, t("createMatch.validation.playersMax")),
    playersTotal: z.coerce.number().min(2, t("createMatch.validation.totalPlayersMin")).max(22, t("createMatch.validation.totalPlayersMax")),
    location: z.string().min(3, t("createMatch.validation.locationRequired")),
    coordinates: z.string().optional(),
    complexName: z.string().optional(),
    complexUrl: z.string().url().optional().or(z.literal('')),
    pricePerPlayer: z.coerce.number().min(0).optional(),
    additionalInfo: z.string().optional(),
    isPrivate: z.boolean().default(false),
  }).refine((data) => {
    // If field type is paid, complex name and price are required
    if (data.fieldType === "paid") {
      return !!data.complexName && typeof data.pricePerPlayer === 'number' && data.pricePerPlayer > 0;
    }
    return true;
  }, {
    message: t("createMatch.validation.paidFieldRequirements"),
    path: ["complexName"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      fieldType: "free",
      duration: 90,
      playersNeeded: 10,
      playersTotal: 10,
      location: "",
      coordinates: "",
      complexName: "",
      complexUrl: "",
      pricePerPlayer: 0,
      additionalInfo: "",
      isPrivate: false,
    },
  });

  const createMatchMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Combine date and time
      const dateTime = new Date(values.date);
      const [hours, minutes] = values.time.split(':').map(Number);
      dateTime.setHours(hours, minutes);

      // Create a new object without the time property and with the formatted date
      const matchData = {
        ...values,
        date: dateTime.toISOString(),
        creatorId: user!.id,
        time: undefined // This will be omitted when converted to JSON
      };

      const res = await apiRequest("POST", "/api/matches", matchData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("createMatch.success"),
        description: t("createMatch.matchCreated"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      setLocation(`/match/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("createMatch.error"),
        description: error.message,
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMatchMutation.mutate(values);
  }

  // Watch fieldType to show/hide complex info
  const fieldType = form.watch("fieldType");
  
  // Update UI when field type changes
  const onFieldTypeChange = (value: string) => {
    form.setValue("fieldType", value as "free" | "paid");
    setShowComplexInfo(value === "paid");
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("createMatch.title")}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{t("createMatch.subtitle")}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg shadow-sm p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Match title */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("createMatch.form.title")}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t("createMatch.form.titlePlaceholder")} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Field type */}
                <div>
                  <FormField
                    control={form.control}
                    name="fieldType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>{t("createMatch.form.fieldType")}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={onFieldTypeChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <div className="border rounded-md px-4 py-3 flex items-center space-x-3 cursor-pointer bg-white hover:bg-gray-50">
                              <RadioGroupItem value="free" id="field-free" />
                              <label htmlFor="field-free" className="cursor-pointer flex-grow text-sm font-medium">
                                {t("createMatch.form.freeField")}
                              </label>
                            </div>
                            <div className="border rounded-md px-4 py-3 flex items-center space-x-3 cursor-pointer bg-white hover:bg-gray-50">
                              <RadioGroupItem value="paid" id="field-paid" />
                              <label htmlFor="field-paid" className="cursor-pointer flex-grow text-sm font-medium">
                                {t("createMatch.form.paidField")}
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Date and time */}
                <div>
                  <FormLabel>{t("createMatch.form.dateAndTime")}</FormLabel>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: dateLocale })
                                  ) : (
                                    <span>{t("createMatch.form.selectDate")}</span>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="time"
                                placeholder="19:30"
                                {...field}
                                className="pl-9"
                              />
                              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Duration */}
                <div>
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("createMatch.form.duration")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={30}
                            step={15}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Players needed */}
                <div>
                  <FormField
                    control={form.control}
                    name="playersTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("createMatch.form.totalPlayers")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={2}
                            max={22}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Players needed */}
                <div>
                  <FormField
                    control={form.control}
                    name="playersNeeded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("createMatch.form.playersNeeded")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={22}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Location */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("createMatch.form.location")}</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <Input
                              placeholder={t("createMatch.form.locationPlaceholder")}
                              className="flex-grow rounded-r-none"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-l-none border-l-0"
                            >
                              <Map className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Map preview */}
                  <div className="mt-3">
                    <MapView 
                      location={form.watch("location") || t("createMatch.form.selectLocation")} 
                      coordinates={form.watch("coordinates")}
                    />
                  </div>
                </div>
                
                {/* Paid field info */}
                {showComplexInfo && (
                  <div className="md:col-span-2 p-4 bg-white rounded-md border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <Info className="w-4 h-4 text-primary mr-2" />
                      {t("createMatch.form.paidFieldInfo")}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="complexName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("createMatch.form.complexName")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("createMatch.form.complexNamePlaceholder")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pricePerPlayer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("createMatch.form.pricePerPlayer")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step={0.5}
                                placeholder="8.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="complexUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("createMatch.form.complexUrl")}</FormLabel>
                              <FormControl>
                                <Input
                                  type="url"
                                  placeholder="https://..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Additional info */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("createMatch.form.additionalInfo")}</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder={t("createMatch.form.additionalInfoPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Private match */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            {t("createMatch.form.privateMatch")}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="mt-8 flex justify-end">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto" 
                  disabled={createMatchMutation.isPending}
                >
                  {createMatchMutation.isPending ? (
                    <>{t("createMatch.creating")}</>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("createMatch.submit")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
