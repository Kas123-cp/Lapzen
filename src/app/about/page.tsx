
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-primary">
            About Lapzen
          </h1>
          <p className="text-lg text-muted-foreground">
            Lapzen was born from a passion for technology and a desire to make premium laptops accessible to everyone in Pakistan. We believe that the right tool can unlock immense potential, whether you're a student, a creative professional, or a business owner.
          </p>
          <p className="text-lg text-muted-foreground">
            Our mission is to provide a curated selection of high-quality new, used, and refurbished laptops from the world's most trusted brands. We're committed to transparency, value, and exceptional customer service, ensuring you find the perfect machine to match your needs and budget.
          </p>
        </div>
        <div>
            <Image 
                src="/hero-banner.png"
                alt="About Lapzen"
                width={500}
                height={300}
                className="rounded-lg shadow-lg object-cover mx-auto"
                data-ai-hint="laptop office"
            />
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">
          Get in Touch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline mt-4">WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="https://wa.me/92309009022" target="_blank" rel="noopener noreferrer" className="text-lg text-muted-foreground hover:text-primary transition-colors">
                +92 309 009022
              </a>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-headline mt-4">Gmail</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:aasim4260@gmail.com" className="text-lg text-muted-foreground hover:text-primary transition-colors">
                aasim4260@gmail.com
              </a>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <MapPin className="h-8 w-8 text-primary" />
                </div>
              <CardTitle className="font-headline mt-4">Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                Hafeez Centre, Lahore
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
