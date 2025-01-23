"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BookingFormProps {
  providerId: Id<"providers">;
  serviceId: Id<"services">;
  onSuccess: () => void;
}

export function BookingForm({ providerId, serviceId, onSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const customFields = useQuery(api.formFields.getFieldsForService, {
    providerId,
    serviceId,
  });

  // Dynamically build form schema based on custom fields
  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    notes: z.string().optional(),
    ...Object.fromEntries(
      (customFields || []).map(field => {
        let validator = z.string();
        if (field.type === "number") {
          validator = z.string().transform(Number);
        }
        if (field.type === "email") {
          validator = z.string().email("Invalid email address");
        }
        if (field.required) {
          validator = validator.min(1, `${field.label} is required`);
        } else {
          validator = validator.optional();
        }
        return [field._id.toString(), validator];
      })
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      notes: "",
      ...Object.fromEntries(
        (customFields || []).map(field => [
          field._id.toString(),
          field.defaultValue || "",
        ])
      ),
    },
  });

  const createAppointment = useMutation(api.appointments.create);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const customFieldResponses = (customFields || []).map(field => ({
        fieldId: field._id,
        value: values[field._id.toString()],
      }));

      await createAppointment({
        providerId,
        serviceId,
        customerName: values.name,
        customerEmail: values.email,
        customerPhone: values.phone,
        date: values.date,
        time: values.time,
        notes: values.notes,
        customFields: customFieldResponses,
      });

      toast({
        title: "Success",
        description: "Your appointment has been booked!",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  }

  function renderCustomField(field: any) {
    const id = field._id.toString();

    return (
      <FormField
        key={id}
        control={form.control}
        name={id}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}{field.required && " *"}</FormLabel>
            <FormControl>
              {field.type === "text" && (
                <Input
                  placeholder={field.placeholder}
                  {...formField}
                />
              )}
              {field.type === "number" && (
                <Input
                  type="number"
                  placeholder={field.placeholder}
                  {...formField}
                />
              )}
              {field.type === "email" && (
                <Input
                  type="email"
                  placeholder={field.placeholder}
                  {...formField}
                />
              )}
              {field.type === "phone" && (
                <Input
                  type="tel"
                  placeholder={field.placeholder}
                  {...formField}
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  placeholder={field.placeholder}
                  {...formField}
                />
              )}
              {field.type === "select" && field.options && (
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.type === "checkbox" && (
                <Checkbox
                  checked={formField.value === "true"}
                  onCheckedChange={checked => formField.onChange(checked ? "true" : "false")}
                />
              )}
              {field.type === "radio" && field.options && (
                <RadioGroup
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  {field.options.map((option: string) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${id}-${option}`} />
                      <label htmlFor={`${id}-${option}`}>{option}</label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone *</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Enter your phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time *</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {customFields?.map(field => renderCustomField(field))}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes or requests"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Book Appointment
        </Button>
      </form>
    </Form>
  );
} 