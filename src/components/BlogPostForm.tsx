import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BlogPostWithTags } from '../integrations/supabase/blog';
import { TablesInsert, TablesUpdate } from '../integrations/supabase/types';

// Define the schema for form validation
const blogPostFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  tags: z.string().optional(), // Tags as a comma-separated string for now
});

type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

interface BlogPostFormProps {
  initialData?: BlogPostWithTags; // Optional initial data for editing
  onSubmit: (values: { title: string; content: string; tagNames: string[] }) => void;
  isLoading?: boolean; // To disable the form while submitting
}

function BlogPostForm({ initialData, onSubmit, isLoading }: BlogPostFormProps) {
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      tags: initialData?.tags.map(tag => tag.name).join(', ') || '',
    },
  });

  // Reset form with initial data when it changes (for editing)
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content,
        tags: initialData.tags.map(tag => tag.name).join(', ') || '',
      });
    }
  }, [initialData, form.reset, form]);

  const handleFormSubmit = (values: BlogPostFormValues) => {
    // Split tags string into an array of names, trimming whitespace
    const tagNames = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    // Pass the values with correct typing, ensuring title and content are treated as strings
    onSubmit({ title: values.title, content: values.content, tagNames });
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register('title')} disabled={isLoading} />
        {form.formState.errors.title && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" {...form.register('content')} disabled={isLoading} rows={10} />
        {form.formState.errors.content && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input id="tags" {...form.register('tags')} disabled={isLoading} placeholder="e.g., technology, finance, markets" />
        {form.formState.errors.tags && (
          <p className="text-red-500 text-sm mt-1">{form.formState.errors.tags.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : (initialData ? 'Update Post' : 'Create Post')}
      </Button>
    </form>
  );
}

export default BlogPostForm; 