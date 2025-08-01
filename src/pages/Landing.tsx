import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bot, Settings, Zap, Shield, Play, Database, Code, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  console.log('🏠 Landing page rendered');

  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "Dynamic Actor Discovery",
      description: "Automatically fetch and list all your Apify actors with real-time schema loading"
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Smart Form Generation",
      description: "Dynamically generate input forms based on actor schemas with validation"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Execution",
      description: "Execute actors with a single click and get immediate results"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Reliable",
      description: "Built with enterprise-grade security and robust error handling"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Flexible Output",
      description: "Choose between OUTPUT and DATASET modes to get exactly what you need"
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Developer Friendly",
      description: "Export results as JSON, copy to clipboard, or download for further processing"
    }
  ];

  const workflow = [
    {
      step: 1,
      title: "Connect",
      description: "Backend automatically authenticates with your Apify account",
      icon: <Shield className="h-5 w-5" />
    },
    {
      step: 2,
      title: "Select",
      description: "Choose from your available actors with intelligent filtering",
      icon: <Bot className="h-5 w-5" />
    },
    {
      step: 3,
      title: "Configure",
      description: "Fill out the dynamically generated form with smart defaults",
      icon: <Settings className="h-5 w-5" />
    },
    {
      step: 4,
      title: "Execute",
      description: "Run your actor and get real-time results with detailed statistics",
      icon: <Play className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <Badge variant="secondary" className="mx-auto">
              Professional Apify Integration
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Apify Actor Runner
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A sophisticated web application that demonstrates seamless integration with the Apify platform. 
              Dynamically discover actors, generate forms from schemas, and execute runs with professional-grade reliability.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/app">
                <Button size="lg" className="px-8 py-6 text-lg group">
                  Start Using the App
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Badge variant="outline" className="text-sm">
                No API Key Required - Backend Handled
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with modern technologies and best practices for reliability, security, and performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A streamlined workflow designed for maximum efficiency and user experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((step, index) => (
              <div key={index} className="relative">
                <Card className="text-center h-full">
                  <CardHeader>
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full font-bold text-lg">
                        {step.step}
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {step.icon}
                      </div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
                
                {index < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Highlights */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Technical Excellence
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Demonstrates mastery of modern web development practices and integration capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Frontend Architecture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>React 18 with TypeScript for type safety</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>TanStack Query for state management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>React Hook Form with dynamic validation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Tailwind CSS with custom design system</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Responsive design with dark mode</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Backend Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Supabase Edge Functions for serverless logic</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Secure API token management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Comprehensive error handling</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Real-time schema fetching</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Detailed logging and monitoring</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl mb-4">
                Ready to Experience Professional Apify Integration?
              </CardTitle>
              <CardDescription className="text-lg">
                See how dynamic schema loading, secure execution, and professional UI/UX come together 
                in this demonstration of integration excellence.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Link to="/app">
                <Button size="lg" className="px-8 py-6 text-lg group">
                  Launch Application
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Backend authentication and API management handled automatically
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-muted/30">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-muted-foreground">
            Built with React, TypeScript, Tailwind CSS, and Supabase • Demonstrates professional web development practices
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;