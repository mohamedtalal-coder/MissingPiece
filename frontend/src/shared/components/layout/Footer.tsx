import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      showToast({
        message: 'Successfully subscribed to The Slow Living Dispatch',
        type: 'success'
      });
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-surface-container-low mt-space-2xl border-t border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-margin lg:px-margin-lg py-space-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-lg">

          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-space-sm mb-space-md">
              <span className="font-headline-sm text-headline-sm text-primary">Missing Piece</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md leading-relaxed">
              Premium wooden puzzles and engaging escapes designed to bring people together and challenge the mind.
            </p>
            <div className="flex items-center gap-space-sm text-secondary">
              <Icon name="spa" className="text-base" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Sustainably Crafted</span>
            </div>
          </div>

          {/* Collections Col */}
          <div className="md:col-span-1">
            <h3 className="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">Shop Collections</h3>
            <ul className="flex flex-col gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li><Link to="/products?category=wooden" className="hover:text-primary transition-colors">Wooden Puzzles</Link></li>
              <li><Link to="/products?category=jigsaw" className="hover:text-primary transition-colors">Jigsaw Puzzles</Link></li>
              <li><Link to="/products?category=3d-mechanical" className="hover:text-primary transition-colors">3D Mechanical</Link></li>
              <li><Link to="/products?category=mystery-escape" className="hover:text-primary transition-colors">Mystery Escapes</Link></li>
            </ul>
          </div>

          {/* Care Col */}
          <div className="md:col-span-1">
            <h3 className="font-label-lg text-label-lg text-on-surface mb-space-md uppercase tracking-wider">Customer Care</h3>
            <ul className="flex flex-col gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li><Link to="/help" className="hover:text-primary transition-colors">Help Center &amp; FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping &amp; Returns</Link></li>
              <li><Link to="/care" className="hover:text-primary transition-colors">Care &amp; Repair Guide</Link></li>
              <li><Link to="/admin" className="hover:text-primary transition-colors flex items-center gap-2"><Icon name="settings" className="text-sm" /> Admin Console</Link></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="md:col-span-1">
            <h3 className="font-label-lg text-label-lg text-on-surface mb-space-xs uppercase tracking-wider">The Missing Piece Dispatch</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Monthly updates on new releases, puzzle tips, and studio news.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-space-sm">
              <Input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface-container-lowest"
              />
              <Button variant="primary" className="w-full">Subscribe</Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-space-2xl pt-space-md border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <p>&copy; {new Date().getFullYear()} Missing Piece. All rights reserved.</p>
          <div className="flex gap-space-md">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
