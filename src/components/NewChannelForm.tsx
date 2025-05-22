import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChannel } from '@/integrations/supabase/chat';

const channelFormSchema = z.object({
  name: z.string().min(1, { message: "Channel name is required." }),
});

type ChannelFormValues = z.infer<typeof channelFormSchema>;

export function NewChannelForm() {
  const queryClient = useQueryClient();
  const form = useForm<ChannelFormValues>({
    resolver: zodResolver(channelFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const createChannelMutation = useMutation({
    mutationFn: createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating channel:", error);
      // Optionally display an error message to the user
    },
  });

  const onSubmit = (values: ChannelFormValues) => {
    createChannelMutation.mutate(values.name);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="channel-name">Channel Name</Label>
        <Input id="channel-name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
        )}
      </div>
      <Button type="submit" disabled={createChannelMutation.status === 'pending'}>
        {createChannelMutation.status === 'pending' ? 'Creating...' : 'Create Channel'}
      </Button>
    </form>
  );
} 