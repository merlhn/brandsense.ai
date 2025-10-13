import { Hono } from "npm:hono";
import { getSupabaseAdminClient, verifyAuth, isValidEmail, isValidPassword, formatErrorResponse, logRequest, logResponse } from "./utils.ts";

export function setupAuthRoutes(app: Hono) {
  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================

  // Sign up endpoint
  app.post("/make-server-cf9a9609/auth/signup", async (c) => {
    try {
      logRequest('POST', '/auth/signup');
      
      const body = await c.req.json();
      const { email, password, fullName } = body;

      // Validation
      if (!email || !password || !fullName) {
        logResponse(400, 'Missing required fields');
        return c.json({ error: 'Missing required fields: email, password, fullName' }, 400);
      }

      if (!isValidEmail(email)) {
        logResponse(400, 'Invalid email format');
        return c.json({ error: 'Invalid email format' }, 400);
      }

      if (!isValidPassword(password)) {
        logResponse(400, 'Password too short');
        return c.json({ error: 'Password must be at least 8 characters long' }, 400);
      }

      // Check for corporate email
      const domain = email.split('@')[1]?.toLowerCase();
      const freeDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'live.com', 'aol.com', 'icloud.com', 'mail.com',
        'protonmail.com', 'yandex.com', 'zoho.com'
      ];

      if (freeDomains.includes(domain)) {
        logResponse(400, 'Corporate email required');
        return c.json({ 
          error: 'Please use your corporate email address. Personal email addresses are not allowed.' 
        }, 400);
      }

      const supabase = getSupabaseAdminClient();

      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
      if (existingUser.user) {
        logResponse(409, 'User already exists');
        return c.json({ error: 'User with this email already exists' }, 409);
      }

      // Create user
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for now
        user_metadata: {
          fullName: fullName.trim(),
        }
      });

      if (error) {
        console.error('Signup error:', error);
        logResponse(500, 'Signup failed');
        return c.json({ error: error.message || 'Failed to create user' }, 500);
      }

      // Create user profile in public.users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          fullName: fullName.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail signup if profile creation fails
      }

      logResponse(201, 'User created successfully');
      return c.json({
        success: true,
        message: 'User created successfully',
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: fullName.trim()
        }
      }, 201);

    } catch (error) {
      console.error('Signup endpoint error:', error);
      logResponse(500, 'Internal server error');
      return c.json(formatErrorResponse(error, 'Internal server error during signup'), 500);
    }
  });

  // Sign in endpoint
  app.post("/make-server-cf9a9609/auth/signin", async (c) => {
    try {
      logRequest('POST', '/auth/signin');
      
      const body = await c.req.json();
      const { email, password } = body;

      if (!email || !password) {
        logResponse(400, 'Missing credentials');
        return c.json({ error: 'Missing required fields: email, password' }, 400);
      }

      const supabase = getSupabaseAdminClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Signin error:', error);
        logResponse(401, 'Invalid credentials');
        return c.json({ error: 'Invalid email or password' }, 401);
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('fullName, position, company')
        .eq('id', data.user.id)
        .single();

      logResponse(200, 'Sign in successful');
      return c.json({
        success: true,
        message: 'Sign in successful',
        accessToken: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: profile?.fullName || data.user.user_metadata?.fullName || '',
          position: profile?.position || null,
          company: profile?.company || null
        }
      });

    } catch (error) {
      console.error('Signin endpoint error:', error);
      logResponse(500, 'Internal server error');
      return c.json(formatErrorResponse(error, 'Internal server error during signin'), 500);
    }
  });

  // Password change endpoint
  app.post("/make-server-cf9a9609/auth/change-password", async (c) => {
    try {
      logRequest('POST', '/auth/change-password');
      
      const authHeader = c.req.header('Authorization');
      const { error: authError, user } = await verifyAuth(authHeader);

      if (authError || !user) {
        logResponse(401, 'Unauthorized');
        return c.json({ error: authError || 'Unauthorized' }, 401);
      }

      const body = await c.req.json();
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        logResponse(400, 'Missing required fields');
        return c.json({ error: 'Missing required fields: currentPassword, newPassword' }, 400);
      }

      if (newPassword.length < 8) {
        logResponse(400, 'Password too short');
        return c.json({ error: 'New password must be at least 8 characters long' }, 400);
      }

      if (currentPassword === newPassword) {
        logResponse(400, 'Same password');
        return c.json({ error: 'New password must be different from current password' }, 400);
      }

      const accessToken = authHeader!.split(' ')[1];
      const supabase = getSupabaseAdminClient();

      // Verify current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (verifyError) {
        console.error('Current password verification failed:', verifyError);
        logResponse(401, 'Current password incorrect');
        return c.json({ error: 'Current password is incorrect' }, 401);
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        logResponse(500, 'Password update failed');
        return c.json({ error: updateError.message || 'Failed to update password' }, 500);
      }

      console.log('✅ Password updated successfully for user:', user.email);
      logResponse(200, 'Password updated successfully');
      return c.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
      console.error('Change password endpoint error:', error);
      logResponse(500, 'Internal server error');
      return c.json(formatErrorResponse(error, 'Internal server error during password change'), 500);
    }
  });
}
