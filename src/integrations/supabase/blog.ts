import { supabase } from "./client";
import { Tables, TablesInsert, TablesUpdate } from "./types";

// Define a type that includes blog post data and its associated tags
export type BlogPostWithTags = Tables<'blog_posts'> & { tags: Tables<'tags'>[] };

// Function to fetch all blog posts, optionally filtered by tag names
export async function getAllBlogPosts(tagNames?: string[]): Promise<BlogPostWithTags[] | null> {
  let query = supabase
    .from('blog_posts')
    .select('*, blog_post_tags(tags(*))')
    .order('created_at', { ascending: false });

  // If tagNames are provided, filter posts that are linked to these tags
  if (tagNames && tagNames.length > 0) {
    // We need to filter blog posts that have *at least one* of the selected tags.
    // A simple approach is to check if the post's ID exists in the blog_post_tags table
    // for any of the selected tag IDs.

    // First, get the IDs of the provided tag names
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('id')
      .in('name', tagNames);

    if (tagsError) {
      console.error('Error fetching tag IDs for filtering:', tagsError);
      // Depending on desired behavior, you might return null or all posts here.
      // Returning null indicates an issue with filtering.
      return null; // Or return await query; to ignore the filter on error
    }

    const tagIds = tagsData?.map(tag => tag.id) || [];

    if (tagIds.length === 0) {
      // If no valid tags were found for the provided names, return no posts.
      return [];
    }

    // Now, query the blog_post_tags table to find blog_post_ids linked to these tagIds
    const { data: postTagLinks, error: linksError } = await supabase
      .from('blog_post_tags')
      .select('blog_post_id')
      .in('tag_id', tagIds);

    if (linksError) {
       console.error('Error fetching post tag links for filtering:', linksError);
       return null; // Or return await query; to ignore the filter on error
    }

    const postIdsToFilter = postTagLinks?.map(link => link.blog_post_id) || [];

    if (postIdsToFilter.length === 0) {
      // If no posts are linked to the selected tags, return an empty array
      return [];
    }

    // Finally, filter the main blog_posts query by the collected post IDs
    query = query.in('id', postIdsToFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts with tags:', error);
    return null;
  }

  const transformedData = data.map(post => ({
    ...post,
    tags: post.blog_post_tags.map(bpt => bpt.tags).filter(tag => tag !== null) as Tables<'tags'>[],
  }));

  return transformedData;
}

// Function to fetch all available tags
export async function getAllTags(): Promise<Tables<'tags'>[] | null> {
  const { data, error } = await supabase
    .from('tags')
    .select('*');

  if (error) {
    console.error('Error fetching all tags:', error);
    return null;
  }

  return data;
}

export async function createBlogPost(post: TablesInsert<'blog_posts'>, tagNames: string[]): Promise<Tables<'blog_posts'> | null> {
  // The user_id should ideally be obtained from the authenticated session
  // before calling this function, or handled by a Supabase function/trigger
  // if stricter server-side control is needed.

  const { data: newPost, error: postError } = await supabase
    .from('blog_posts')
    .insert(post)
    .select()
    .single();

  if (postError || !newPost) {
    console.error('Error creating blog post:', postError);
    return null;
  }

  // If tags are provided, find or create them and link to the new post
  if (tagNames && tagNames.length > 0) {
    // First, find existing tags by name
    const { data: existingTags, error: fetchTagsError } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', tagNames);

    if (fetchTagsError) {
      console.error('Error fetching existing tags:', fetchTagsError);
      // We might want to rollback the post creation here, or handle it differently.
      // For now, we'll just log the error and proceed without linking tags.
    }

    const existingTagNames = existingTags?.map(tag => tag.name) || [];
    const newTagNames = tagNames.filter(tagName => !existingTagNames.includes(tagName));

    // Create new tags that don't exist
    if (newTagNames.length > 0) {
      const { data: createdTags, error: createTagsError } = await supabase
        .from('tags')
        .insert(newTagNames.map(name => ({ name })))
        .select('id, name');

      if (createTagsError) {
        console.error('Error creating new tags:', createTagsError);
        // Again, consider rollback or error handling.
      }

      // Combine existing and newly created tags to get their IDs
      const allTags = [...(existingTags || []), ...(createdTags || [])];
      const tagLinks = allTags.map(tag => ({
        blog_post_id: newPost.id,
        tag_id: tag.id,
      }));

      // Link tags to the blog post in the junction table
      if (tagLinks.length > 0) {
        const { error: linkTagsError } = await supabase
          .from('blog_post_tags')
          .insert(tagLinks);

        if (linkTagsError) {
          console.error('Error linking tags to blog post:', linkTagsError);
          // Error linking, post created but tags might not be linked.
        }
      }
    }
  }

  // Refetch the post with tags to return the complete object
  const { data: postWithTags, error: fetchPostError } = await supabase
    .from('blog_posts')
    .select('*, blog_post_tags(tags(*))')
    .eq('id', newPost.id)
    .single();

  if (fetchPostError || !postWithTags) {
    console.error('Error refetching blog post with tags after creation:', fetchPostError);
    return null;
  }

  const transformedPostWithTags = {
    ...postWithTags,
    tags: postWithTags.blog_post_tags.map(bpt => bpt.tags).filter(tag => tag !== null) as Tables<'tags'>[],
  };

  return transformedPostWithTags;
}

export async function getBlogPostById(id: string): Promise<BlogPostWithTags | null> {
  // Fetch a single blog post and join with blog_post_tags and tags tables
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_post_tags(tags(*))')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error(`Error fetching blog post with ID ${id} and tags:`, error);
    return null;
  }

  // Transform the data to match BlogPostWithTags
  const transformedData = {
    ...data,
    tags: data.blog_post_tags.map(bpt => bpt.tags).filter(tag => tag !== null) as Tables<'tags'>[],
  };

  return transformedData;
}

export async function updateBlogPost(id: string, updates: TablesUpdate<'blog_posts'>, tagNames?: string[]): Promise<BlogPostWithTags | null> {
  // RLS policies in Supabase should enforce that only the owner can update their post.
  // We do not explicitly check ownership here in the client-side function.

  const { data: updatedPost, error: updateError } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (updateError || !updatedPost) {
    console.error(`Error updating blog post with ID ${id}:`, updateError);
    return null;
  }

  // Handle tag updates if tagNames are provided
  if (tagNames !== undefined) { // Use undefined to allow clearing tags with an empty array
    // First, remove existing tag links for this post
    const { error: deleteLinksError } = await supabase
      .from('blog_post_tags')
      .delete()
      .eq('blog_post_id', id);

    if (deleteLinksError) {
      console.error(`Error deleting existing tag links for post ${id}:`, deleteLinksError);
      // Continue with creating new links, but log the error.
    }

    // Then, find or create the new tags and link them
    if (tagNames.length > 0) {
       // First, find existing tags by name
      const { data: existingTags, error: fetchTagsError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', tagNames);

      if (fetchTagsError) {
        console.error('Error fetching existing tags during update:', fetchTagsError);
      }

      const existingTagNames = existingTags?.map(tag => tag.name) || [];
      const newTagNames = tagNames.filter(tagName => !existingTagNames.includes(tagName));

      // Create new tags that don't exist
      let allTags = [...(existingTags || [])];
      if (newTagNames.length > 0) {
        const { data: createdTags, error: createTagsError } = await supabase
          .from('tags')
          .insert(newTagNames.map(name => ({ name })))
          .select('id, name');

        if (createTagsError) {
          console.error('Error creating new tags during update:', createTagsError);
        }
        allTags = [...allTags, ...(createdTags || [])];
      }

      // Link tags to the blog post in the junction table
      const tagLinks = allTags.map(tag => ({
        blog_post_id: id,
        tag_id: tag.id,
      }));

      if (tagLinks.length > 0) {
        const { error: linkTagsError } = await supabase
          .from('blog_post_tags')
          .insert(tagLinks);

        if (linkTagsError) {
          console.error(`Error linking new tags for post ${id}:`, linkTagsError);
        }
      }
    }
  }

  // Refetch the post with updated tags to return the complete object
  const { data: postWithTags, error: fetchPostError } = await supabase
    .from('blog_posts')
    .select('*, blog_post_tags(tags(*))')
    .eq('id', id)
    .single();

  if (fetchPostError || !postWithTags) {
    console.error(`Error refetching blog post with ID ${id} after update:`, fetchPostError);
    return null;
  }

  const transformedPostWithTags = {
    ...postWithTags,
    tags: postWithTags.blog_post_tags.map(bpt => bpt.tags).filter(tag => tag !== null) as Tables<'tags'>[],
  };

  return transformedPostWithTags;
}

export async function deleteBlogPost(id: string): Promise<true | null> {
  // RLS policies in Supabase should enforce that only the owner can delete their post.
  // We do not explicitly check ownership here in the client-side function.

  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting blog post with ID ${id}:`, error);
    return null;
  }

  // If no error, the deletion attempt was processed by Supabase.
  // RLS handles whether the user actually had permissions to delete.
  return true;
}

// TODO: Add functions for fetching a single post, updating a post, and deleting a post
// These will require authentication and ownership checks. 