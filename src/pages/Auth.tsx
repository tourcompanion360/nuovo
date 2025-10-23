import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2, Mail, Lock, User, Phone, Globe } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [justSignedUp, setJustSignedUp] = useState(false);

  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
    contactEmail: '',
    phone: '',
    website: '',
  });

  // Input styles for white background
  const inputClass = "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(signInData.email, signInData.password);

      if (error) {
        toast({
          title: 'Authentication Error',
          description: error.message || 'Failed to sign in. Please check your credentials.',
          variant: 'destructive',
        });
        return;
      }

      if (data?.user) {
        console.log('🔍 User signed in successfully:', data.user.id);
        
        // Check if creator profile exists
        const { data: creatorData, error: creatorError } = await supabase
          .from('creators')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        console.log('🔍 Creator profile check:', { creatorData, creatorError });

        // Handle any database connection issues
        if (creatorError) {
          console.error('❌ Database error:', creatorError);
          toast({
            title: 'Database Connection Issue',
            description: `Database error: ${creatorError.message}. Please refresh the page and try again.`,
            variant: 'destructive',
          });
          return;
        }

        if (!creatorData) {
          console.log('🔍 No creator profile found, attempting to create one...');
          
          // If no profile found, try to create one (user might have confirmed email)
          if (data.user.email_confirmed_at) {
            const { error: createError } = await supabase
              .from('creators')
              .insert({
                user_id: data.user.id,
                agency_name: data.user.user_metadata?.agency_name || 'TourCompanion',
                contact_email: data.user.email || '',
                agency_logo: '/tourcompanion-logo.png',
                subscription_plan: 'basic',
                subscription_status: 'active',
              });

            if (createError) {
              console.error('Failed to create creator profile:', createError);
              console.error('Error details:', createError);
              toast({
                title: 'Account Setup Issue',
                description: `Profile setup failed: ${createError.message}. Please try signing out and back in, or contact support if the issue persists.`,
                variant: 'destructive',
              });
              await supabase.auth.signOut();
              return;
            } else {
              console.log('✅ Creator profile created successfully');
            }
          } else {
            toast({
              title: '📧 Email Not Confirmed Yet',
              description: `Please check your email (${data.user.email}) and click the confirmation link before signing in. Check your spam folder if you don't see it.`,
              variant: 'destructive',
            });
            await supabase.auth.signOut();
            return;
          }
        } else {
          console.log('✅ Creator profile found:', creatorData.agency_name);
        }

        toast({
          title: 'Welcome Back!',
          description: `Signed in successfully as ${creatorData?.agency_name || 'My Agency'}`,
        });

        // Clear the signup flag
        setJustSignedUp(false);
        navigate('/');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    if (!signUpData.agencyName || !signUpData.contactEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    if (!emailRegex.test(signUpData.contactEmail)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid contact email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await signUp(
        signUpData.email,
        signUpData.password,
        {
          agency_name: signUpData.agencyName,
          phone: signUpData.phone,
          website: signUpData.website,
        }
      );

      if (authError) {
        toast({
          title: 'Sign Up Error',
          description: authError.message || 'Failed to create account.',
          variant: 'destructive',
        });
        return;
      }

      if (authData?.user) {
        console.log('User created:', authData.user.email, 'Confirmed:', authData.user.email_confirmed_at);
        
        // Check if email confirmation is required
        if (authData.user.email_confirmed_at === null) {
          toast({
            title: '📧 Email Confirmation Required!',
            description: `We sent a confirmation link to ${signUpData.email}. Please check your inbox (and spam folder) and click the confirmation link to activate your account. You can then sign in below.`,
            variant: 'default',
          });
          
          // Set flag to show confirmation message
          setJustSignedUp(true);
          
          // Switch to sign in tab
          setActiveTab('signin');
          setSignInData({
            email: signUpData.email,
            password: signUpData.password,
          });

          // Reset sign up form
          setSignUpData({
            email: '',
            password: '',
            confirmPassword: '',
            agencyName: '',
            contactEmail: '',
            phone: '',
            website: '',
          });
          return;
        }

        // This should never happen since email confirmation is required
        // But if it does, the database trigger will handle profile creation
        console.log('Unexpected: User email already confirmed during signup');
        
        toast({
          title: 'Account Created!',
          description: 'Your creator account has been set up successfully. You can now sign in.',
        });

        // Switch to sign in tab
        setActiveTab('signin');
        setSignInData({
          email: signUpData.email,
          password: signUpData.password,
        });

        // Reset sign up form
        setSignUpData({
          email: '',
          password: '',
          confirmPassword: '',
          agencyName: '',
          contactEmail: '',
          phone: '',
          website: '',
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TourCompanion</h1>
          <p className="text-gray-600">Manage your virtual tours and clients</p>
        </div>

        <Card className="shadow-2xl border-gray-200 bg-white text-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-900">Tour Creator Portal</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Sign In Tab */}
              <TabsContent value="signin">
                {justSignedUp && signInData.email && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>📧 IMPORTANT: Email Confirmation Required!</strong><br/>
                      We sent a confirmation link to <strong>{signInData.email}</strong>. 
                      <br/><br/>
                      <strong>Next Steps:</strong>
                      <br/>1. Check your inbox (and spam folder)
                      <br/>2. Click the confirmation link in the email
                      <br/>3. Come back here and sign in below
                    </p>
                  </div>
                )}
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        className={`pl-9 ${inputClass}`}
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-9 ${inputClass}`}
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>📧 After signing up:</strong> You'll receive an email confirmation link. Click it to activate your account, then return here to sign in.
                  </p>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-agency">Agency Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-agency"
                        type="text"
                        placeholder="Your Agency Name"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.agencyName}
                        onChange={(e) => setSignUpData({ ...signUpData, agencyName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-contact-email">Contact Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-contact-email"
                        type="email"
                        placeholder="contact@agency.com"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.contactEmail}
                        onChange={(e) => setSignUpData({ ...signUpData, contactEmail: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.website}
                        onChange={(e) => setSignUpData({ ...signUpData, website: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className={`pl-9 ${inputClass}`}
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            Don't have an account yet? <span className="text-primary font-medium cursor-pointer hover:underline" onClick={() => setActiveTab('signup')}>Sign up now</span> to start creating amazing virtual tours!
          </p>
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
