import Link from 'next/link';
import Image from 'next/image';
import { Mail, MessageSquare, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
               <Image 
                 src="/logo.png" 
                 alt="Lapzen logo icon"
                 width={40}
                 height={40}
                 className="h-10 w-auto object-contain"
               />
               <span className="text-3xl font-extrabold font-headline text-primary">
                Lapzen
               </span>
            </Link>
            <p className="font-body text-muted-foreground">
              Your one-stop shop for premium laptops in Pakistan.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 font-body">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Admin</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-2 font-body text-muted-foreground">
                <li className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary"/>
                    <a href="https://wa.me/92309009022" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        +92 309 009022
                    </a>
                </li>
                <li className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary"/>
                    <a href="mailto:aasim4260@gmail.com" className="hover:text-primary transition-colors">
                        aasim4260@gmail.com
                    </a>
                </li>
                 <li className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-primary mt-1"/>
                    <span>Hafeez Centre, Lahore</span>
                </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-muted-foreground font-body">
          <p>&copy; {new Date().getFullYear()} Lapzen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
