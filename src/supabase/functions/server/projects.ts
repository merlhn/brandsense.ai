import { Hono } from "npm:hono";
import { getSupabaseAdminClient, verifyAuth, generateProjectId, validateProjectData, formatErrorResponse, logRequest, logResponse } from "./utils.ts";

export function setupProjectRoutes(app: Hono) {
  // ============================================
  // PROJECT MANAGEMENT ENDPOINTS
  // ============================================

  // Get all projects for user
  app.get("/make-server-cf9a9609/projects", async (c) => {
    try {
      logRequest('GET', '/projects');
      
      const authHeader = c.req.header('Authorization');
      const { error: authError, user } = await verifyAuth(authHeader);

      if (authError || !user) {
        logResponse(401, 'Unauthorized');
        return c.json({ error: authError || 'Unauthorized' }, 401);
      }

      const supabase = getSupabaseAdminClient();

      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Projects fetch error:', error);
        logResponse(500, 'Failed to fetch projects');
        return c.json({ error: error.message || 'Failed to fetch projects' }, 500);
      }

      logResponse(200, `Fetched ${projects.length} projects`);
      return c.json({
        success: true,
        projects: projects || []
      });

    } catch (error) {
      console.error('Projects endpoint error:', error);
      logResponse(500, 'Internal server error');
      return c.json(formatErrorResponse(error, 'Internal server error during projects fetch'), 500);
    }
  });

  // Get single project
  app.get("/make-server-cf9a9609/projects/:id", async (c) => {
    try {
      const projectId = c.req.param('id');
      logRequest('GET', `/projects/${projectId}`);
      
      const authHeader = c.req.header('Authorization');
      const { error: authError, user } = await verifyAuth(authHeader);

      if (authError || !user) {
        logResponse(401, 'Unauthorized');
        return c.json({ error: authError || 'Unauthorized' }, 401);
      }

      const supabase = getSupabaseAdminClient();

      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Project fetch error:', error);
        logResponse(404, 'Project not found');
        return c.json({ error: 'Project not found' }, 404);
      }

      logResponse(200, 'Project fetched successfully');
      return c.json({
        success: true,
        project: project
      });

    } catch (error) {
      console.error('Project endpoint error:', error);
      logResponse(500, 'Internal server error');
      return c.json(formatErrorResponse(error, 'Internal server error during project fetch'), 500);
    }
  });

  // Create new project
  app.post("/make-server-cf9a9609/projects", async (c) => {
    try {
      logRequest('POST', '/projects');
      
      const authHeader = c.req.header('Authorization');
      const { error: authError, user } = await verifyAuth(authHeader);

      if (authError || !user) {
        logResponse(401, 'Unauthorized');
        return c.json({ error: authError || 'Unauthorized' }, 401);
      }

      const body = await c.req.json();
      const { name, market, language, description, industry, websiteUrl } = body;

      // Validate required fields
      const validation = validateProjectData({ name, market, language, description, industry, websiteUrl });
      if (!validation.isValid) {
        logResponse(400, 'Validation failed');
        return c.json({ error: 'Validation failed', details: validation.errors }, 400);
      }

      const projectId = generateProjectId();
      const supabase = getSupabaseAdminClient();

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          id: projectId,
          user_id: user.id,
          name: name.trim(),
          market: market.trim(),
          language: language.trim(),
          description: description?.trim() || null,
          industry: industry?.trim() || null,
          website_url: websiteUrl?.trim() || null,
          data_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Project creation error:', error);
        logResponse(500, 'Failed to create project');
        return c.json({ error: error.message || 'Failed to create project' }, 500);
      }

      console.log('✅ Project created successfully:', project.name);
      logResponse(201, 'Project created successfully');
      return c.json({
        success: true,
        message: 'Project created successfully',
        project: project
      }, 201);

    } catch (error) {
      console.error('Project creation endpoint error:', error);
      logResponse(500, 'Internal server error');
      return c.json(formatErrorResponse(error, 'Internal server error during project creation'), 500);
    }
  });

  // Update project
  app.put("/make-server-cf9a9609/projects/:id", async (c) => {
    try {
      const projectId = c.req.param('id');
      logRequest('PUT', `/projects/${projectId}`);
      
      const authHeader = c.req.header('Authorization');
      if (!authHeader) {
        logResponse(401, 'Missing authorization header');
        return c.json({ code: 401, error: 'Missing authorization header', message: 'Please sign in to update project' }, 401);
      }

      const accessToken = authHeader.split(' ')[1];
      const body = await c.req.json();
      const { name, market, language, description, industry, websiteUrl } = body;

      if (!name || !market || !language) {
        logResponse(400, 'Missing required fields');
        return c.json({ error: 'Missing required fields: name, market, language' }, 400);
      }

      const supabase = getSupabaseAdminClient();

      // Check if project exists and belongs to user
      const { data: existingProject, error: checkError } = await supabase
        .from('projects')
        .select('id, user_id')
        .eq('id', projectId)
        .single();

      if (checkError || !existingProject) {
        logResponse(404, 'Project not found');
        return c.json({ error: 'Project not found' }, 404);
      }

      // Update project
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({
          name: name.trim(),
          market: market.trim(),
          language: language.trim(),
          description: description?.trim() || null,
          industry: industry?.trim() || null,
          website_url: websiteUrl?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (updateError) {
        console.error('Project update error:', updateError);
        logResponse(500, 'Failed to update project');
        return c.json({ error: updateError.message || 'Failed to update project' }, 500);
      }

      console.log('✅ Project updated successfully:', updatedProject.name);
      logResponse(200, 'Project updated successfully');
      return c.json({ 
        success: true, 
        message: 'Project updated successfully', 
        project: updatedProject 
      });

    } catch (error) {
      console.error('Project update endpoint error:', error);
      logResponse(500, 'Internal server error');
      return c.json(formatErrorResponse(error, 'Internal server error during project update'), 500);
    }
  });

  // Delete project
  app.delete("/make-server-cf9a9609/projects/:id", async (c) => {
    try {
      const projectId = c.req.param('id');
      logRequest('DELETE', `/projects/${projectId}`);
      
      const authHeader = c.req.header('Authorization');
      const { error: authError, user } = await verifyAuth(authHeader);

      if (authError || !user) {
        logResponse(401, 'Unauthorized');
        return c.json({ error: authError || 'Unauthorized' }, 401);
      }

      const supabase = getSupabaseAdminClient();

      // Check if project exists and belongs to user
      const { data: existingProject, error: checkError } = await supabase
        .from('projects')
        .select('id, user_id, name')
        .eq('id', projectId)
        .single();

      if (checkError || !existingProject) {
        logResponse(404, 'Project not found');
        return c.json({ error: 'Project not found' }, 404);
      }

      // Delete project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (deleteError) {
        console.error('Project deletion error:', deleteError);
        logResponse(500, 'Failed to delete project');
        return c.json({ error: deleteError.message || 'Failed to delete project' }, 500);
      }

      console.log('✅ Project deleted successfully:', existingProject.name);
      logResponse(200, 'Project deleted successfully');
      return c.json({ 
        success: true, 
        message: 'Project deleted successfully' 
      });

    } catch (error) {
      console.error('Project deletion endpoint error:', error);
      logResponse(500, 'Internal server error');
      return c.json(formatErrorResponse(error, 'Internal server error during project deletion'), 500);
    }
  });
}
