import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WHATSAPP_NUMBER, INSTAGRAM_URL } from './constants';
import { 
  Instagram, 
  Sparkles, 
  Camera, 
  Scissors, 
  Heart, 
  MessageCircle, 
  Menu, 
  X,
  Calendar,
  User,
  Mail,
  Palette,
  Trash2,
  ChevronLeft,
  LayoutDashboard,
  Clock,
  CheckCircle2,
  MapPin
} from 'lucide-react';

// --- Components ---

const AdminDashboard = ({ token, onLogout, onBack }: { token: string, onLogout: () => void, onBack: () => void }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 403) {
        onLogout();
        return;
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/bookings/${id}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 403) {
        onLogout();
        return;
      }
      const data = await response.json();
      if (response.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
      } else {
        alert(data.error || "Failed to confirm booking");
      }
    } catch (err) {
      alert("Connection error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch('/api/bookings/' + deleteId, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 403) {
        onLogout();
        return;
      }
      setBookings(bookings.filter(b => b.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert("Failed to delete booking");
    }
  };

  const handleClearAllConfirm = async () => {
    try {
      const response = await fetch('/api/bookings', { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 403) {
        onLogout();
        return;
      }
      setBookings([]);
      setIsClearingAll(false);
    } catch (err) {
      alert("Failed to clear bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6 pb-20">
      {/* Custom Confirmation Modals */}
      <AnimatePresence>
        {(deleteId || isClearingAll) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setDeleteId(null); setIsClearingAll(false); }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-gray-100"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-playfair mb-2">Confirm Deletion</h3>
              <p className="text-gray-500 font-light mb-8">
                {isClearingAll 
                  ? "This will permanently remove ALL recorded bookings. This action cannot be reversed." 
                  : "Are you sure you want to remove this booking from your records?"}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setDeleteId(null); setIsClearingAll(false); }}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={isClearingAll ? handleClearAllConfirm : handleDeleteConfirm}
                  className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-200 hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-brand font-semibold hover:gap-3 transition-all w-fit"
            >
              <ChevronLeft size={20} />
              Back to Public Site
            </button>
            <button 
              onClick={onLogout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-brand w-8 h-8" />
            <h1 className="text-3xl font-bold font-playfair">Admin Dashboard</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: <Calendar className="text-blue-500" /> },
            { label: 'New Today', value: bookings.filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString()).length, icon: <Sparkles className="text-yellow-500" /> },
            { label: 'Actions', value: 'Clear All', icon: <Trash2 className="text-red-500 cursor-pointer" onClick={() => setIsClearingAll(true)} /> },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                {stat.label === 'Actions' ? (
                  <button 
                    onClick={() => setIsClearingAll(true)}
                    className="text-red-500 font-bold text-sm mt-1 hover:underline active:opacity-70 transition-all"
                  >
                    Clear All Data
                  </button>
                ) : (
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                )}
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl">{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold font-playfair">Recent Bookings</h2>
          </div>
          
          {loading ? (
            <div className="p-20 text-center text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-20 text-center text-gray-500">No bookings yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Client Info</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Service & Date</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Requirements</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={booking.id} 
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-6">
                        <div className="font-bold text-gray-900">{booking.name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Mail size={12} /> {booking.email}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-brand font-semibold text-sm">{booking.service}</div>
                        <div className="text-[10px] text-gray-500 mt-1 flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Calendar size={10} /> {new Date(booking.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={10} /> {booking.time}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 max-w-xs">
                        <p className="text-xs text-gray-600 truncate" title={booking.requirements}>
                          {booking.requirements || 'No specific requirements'}
                        </p>
                      </td>
                      <td className="px-6 py-6">
                        {booking.status === 'confirmed' ? (
                          <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 w-fit">
                            <CheckCircle2 size={10} /> Confirmed
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded-full uppercase tracking-wider w-fit">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 text-right">
                          {booking.status !== 'confirmed' && (
                            <button 
                              onClick={() => handleConfirm(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="px-3 py-1.5 bg-brand text-white text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-brand/90 transition-all disabled:opacity-50"
                            >
                              {actionLoading === booking.id ? 'Confirming...' : 'Confirm'}
                            </button>
                          )}
                          <button 
                            onClick={() => setDeleteId(booking.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ onLogin, onBack }: { onLogin: (token: string) => void, onBack: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.token);
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-brand/10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-light text-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard size={32} />
          </div>
          <h1 className="text-3xl font-bold font-playfair">Admin Access</h1>
          <p className="text-gray-500 mt-2">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              required
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-brand-light rounded-2xl outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
            />
          </div>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              required
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-brand-light rounded-2xl outline-none focus:ring-2 focus:ring-brand/20 transition-all font-medium"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <button 
          onClick={onBack}
          className="w-full mt-6 text-gray-400 font-medium hover:text-brand transition-colors text-sm"
        >
          Cancel and return to site
        </button>
      </motion.div>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Location', href: '#location' },
    { name: 'Booking', href: '#booking' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex justify-between items-center">
        <div className="text-2xl md:text-3xl font-bold text-brand font-playfair tracking-tight">
          Zaisha Makeup
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <ul className="flex gap-8">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="text-sm font-medium text-gray-600 hover:text-brand transition-colors duration-300 uppercase tracking-widest"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 -mr-2 text-gray-900 transition-transform active:scale-90" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-20 inset-x-0 bg-white shadow-2xl border-t border-gray-50 overflow-hidden z-[90] h-[calc(100vh-80px)] overflow-y-auto"
          >
            <div className="p-8 flex flex-col h-full justify-between pb-24">
              <ul className="flex flex-col gap-6">
                {navLinks.map((link, i) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <a 
                      href={link.href} 
                      className="text-4xl font-playfair text-gray-900 active:text-brand transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                <div className="flex justify-center gap-8 text-brand/60">
                   <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
                     <Instagram size={24} />
                   </a>
                   <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
                     <MessageCircle size={24} />
                   </a>
                   <a href="mailto:contact@zaisha.studio" className="hover:text-brand transition-colors">
                     <Mail size={24} />
                   </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative px-4 md:px-8 max-w-screen-2xl mx-auto min-h-[90vh] md:min-h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between py-32 lg:py-0 gap-16 overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 text-center lg:text-left z-10"
      >
        <div className="inline-block px-4 py-1.5 bg-brand/10 text-brand rounded-full text-[10px] uppercase font-bold tracking-[0.3em] mb-8">
          Professional Artistry
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl leading-[0.9] text-gray-950 font-playfair font-normal">
          Luxury <span className="italic block sm:inline">Makeup</span><br />
          <span className="text-brand">Artistry</span>
        </h1>
        <p className="mt-8 text-base md:text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
          Redefining beauty with bespoke bridal and editorial glam. 
          Experience a flawless transition into your most radiant self 
          for your most cherished moments.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center lg:justify-start gap-4 sm:gap-6">
          <a 
            href="#booking" 
            className="px-10 py-5 bg-gray-900 text-white rounded-full font-semibold shadow-2xl hover:bg-brand transition-all duration-500 text-center uppercase tracking-widest text-xs min-h-[56px] flex items-center justify-center"
          >
            Book Appointment
          </a>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 relative w-full lg:max-w-[45%]"
      >
        <div className="relative group">
          <motion.div 
             animate={{ y: [0, -20, 0] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="relative z-10"
          >
            <img 
              src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=1200&auto=format&fit=crop" 
              alt="Luxury Makeup" 
              className="rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] w-full object-cover aspect-[4/5] sm:aspect-video lg:aspect-auto"
            />
          </motion.div>
          {/* Accent frame */}
          <div className="absolute -inset-4 border border-brand/20 rounded-[3.5rem] -z-10 group-hover:inset-0 transition-all duration-700 hidden sm:block" />
        </div>
      </motion.div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="py-24 md:py-40 px-4 md:px-8 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex-1 relative"
          >
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?q=80&w=800&auto=format&fit=crop" 
                alt="Zaisha Makeup Artist" 
                className="rounded-[3rem] shadow-2xl w-full object-cover aspect-[4/5]"
              />
              <div className="absolute -bottom-10 -right-10 bg-brand text-white p-8 rounded-[2rem] hidden md:block">
                <span className="text-4xl font-playfair block">10+</span>
                <span className="text-[10px] uppercase tracking-widest opacity-80">Years Experience</span>
              </div>
            </div>
            <div className="absolute -inset-4 border border-brand/10 rounded-[3.5rem] -z-10 translate-x-8 translate-y-8" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex-1"
          >
            <span className="text-brand font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">The Artist</span>
            <h2 className="text-5xl md:text-7xl font-playfair leading-[1.1] text-gray-950 mb-8">
              Meet <span className="italic text-brand">Zaisha</span>
            </h2>
            <div className="space-y-6 text-gray-600 font-light leading-loose text-lg">
              <p>
                With over a decade of dedication to the art of transformation, Zaisha has established herself as a leading voice in luxury bridal and editorial makeup.
              </p>
              <p>
                Her philosophy centers on "Enhanced Authenticity"—the belief that makeup should never mask, but rather illuminate the most exquisite versions of her clients.
              </p>
              <p>
                From intimate destination weddings to high-fashion editorial sets, her meticulous attention to detail and calm presence have made her a sought-after artist for those who demand nothing less than perfection.
              </p>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center gap-8">
              <div>
                <span className="block text-2xl font-playfair text-gray-900">500+</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Happy Brides</span>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div>
                <span className="block text-2xl font-playfair text-gray-900">Premium</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Products Only</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const [filter, setFilter] = React.useState('All');
  
  const categories = ['All', 'Bridal', 'Event', 'Editorial'];

  const services = [
    {
      icon: <Heart strokeWidth={1} />,
      title: 'Bridal Editorial',
      desc: 'Sophisticated bridal looks with elite luxury finishing and long-lasting HD glam.',
      category: 'Bridal'
    },
    {
      icon: <Sparkles strokeWidth={1} />,
      title: 'Modern Glam',
      desc: 'From soft transitions to bold statement looks for your most exclusive events.',
      category: 'Event'
    },
    {
      icon: <Camera strokeWidth={1} />,
      title: 'Studio Tech',
      desc: 'High-definition techniques optimized for commercial photography and cinema.',
      category: 'Editorial'
    },
    {
      icon: <Scissors strokeWidth={1} />,
      title: 'Couture Styling',
      desc: 'Bespoke hair design architected to complement your specific features and look.',
      category: 'Event'
    },
    {
      icon: <Palette strokeWidth={1} />,
      title: 'Fashion Runway',
      desc: 'Avant-garde and high-concept makeup for catwalks and forward-thinking fashion shows.',
      category: 'Editorial'
    },
    {
      icon: <Sparkles strokeWidth={1} />,
      title: 'Engagement Prep',
      desc: 'Graceful and timeless looks perfect for your pre-wedding celebrations and shoots.',
      category: 'Bridal'
    }
  ];

  const filteredServices = filter === 'All' 
    ? services 
    : services.filter(s => s.category === filter);

  return (
    <section id="services" className="py-24 md:py-40 px-4 md:px-8 bg-brand-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center md:text-left md:flex md:items-end md:justify-between">
          <div className="max-w-xl">
            <span className="text-brand font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">Excellence in Artistry</span>
            <h2 className="text-5xl md:text-7xl font-playfair leading-[1.1] text-gray-950">
              The <span className="italic">Service</span> Menu
            </h2>
          </div>
          <p className="mt-8 md:mt-0 text-gray-500 max-w-md md:text-right font-light italic leading-loose">
            Precision-crafted beauty experiences tailored to your distinctive identity and the occasion's requirements.
          </p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-16">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                filter === cat 
                  ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-brand/40 hover:text-brand'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service, i) => (
              <motion.div 
                key={service.title}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -8 }}
                className="p-10 md:p-12 bg-white border border-gray-100 rounded-[2.5rem] group hover:border-brand/20 transition-all duration-500"
              >
                <div className="text-brand w-16 h-16 mb-8 flex items-center justify-center bg-brand-bg rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  {React.cloneElement(service.icon as React.ReactElement, { size: 32 })}
                </div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-playfair text-gray-900">{service.title}</h3>
                  <span className="text-[8px] uppercase tracking-tighter bg-gray-50 px-2 py-1 rounded-md text-gray-400 font-bold">
                    {service.category}
                  </span>
                </div>
                <p className="text-gray-500 font-light text-sm leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const Location = () => {
  return (
    <section id="location" className="py-24 md:py-40 px-4 md:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 order-2 lg:order-1">
            <span className="text-brand font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">Visit Us</span>
            <h2 className="text-5xl md:text-7xl font-playfair text-gray-950 mb-10 leading-[1.1]">
              The <span className="italic">Studio</span>
            </h2>
            
            <div className="space-y-10">
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-brand-bg flex items-center justify-center text-brand shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-playfair mb-2">Lucknow Studio</h4>
                  <p className="text-gray-500 font-light leading-relaxed">
                    12, Hazratganj, Lucknow<br />
                    Uttar Pradesh 226001, India
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl bg-brand-bg flex items-center justify-center text-brand shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-playfair mb-2">Studio Hours</h4>
                  <p className="text-gray-500 font-light leading-relaxed">
                    Monday – Friday: 09:00 – 20:00<br />
                    Saturday: 08:00 – 18:00<br />
                    <span className="text-brand/60 italic text-sm">Sunday: By Appointment Only</span>
                  </p>
                </div>
              </div>
              
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-4 text-[10px] uppercase font-bold tracking-[0.3em] text-brand border-b border-brand/20 pb-1 hover:border-brand transition-all"
              >
                Get Directions
              </a>
            </div>
          </div>

          <div className="flex-1 w-full order-1 lg:order-2 h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56963.53508191419!2d80.9134839846387!3d26.846708802951933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd991f32b16b%3A0x93ccfd8909867982!2sLucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1715522000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Studio Location"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Booking = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    service: '',
    requirements: ''
  });
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastBookingId, setLastBookingId] = useState<string | null>(null);

  const validate = () => {
    const errors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.name.trim()) errors.name = 'Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      if (selectedDate <= today) {
        errors.date = 'Please select a future date';
      }
    }

    if (!formData.time) errors.time = 'Time is required';
    if (!formData.service) errors.service = 'Please select a service';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setStatus('loading');
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmittedData(data.booking);
        setStatus('success');
        setMessage(data.message);
        setLastBookingId(data.booking.id);
        
        // Automatically trigger WhatsApp redirect after saving to DB
        const messageText = `Hello Zaisha Makeup! I've just booked an appointment via your website.\n\n*Name:* ${data.booking.name}\n*Service:* ${data.booking.service}\n*Date:* ${data.booking.date}\n*Time:* ${data.booking.time}\n*Requirements:* ${data.booking.requirements || 'None'}`;
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;
        window.open(whatsappUrl, '_blank');

        setFormData({ name: '', email: '', date: '', time: '', service: '', requirements: '' });
        setFieldErrors({});
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Failed to connect to server');
    }
  };

  const handleCancelLastBooking = async () => {
    if (!lastBookingId || !confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await fetch(`/api/bookings/${lastBookingId}`, { method: 'DELETE' });
      setStatus('idle');
      setLastBookingId(null);
      setSubmittedData(null);
      alert('Your booking has been cancelled.');
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };


  return (
    <section id="booking" className="py-24 md:py-40 px-4 md:px-8 bg-brand-bg relative">
       {/* Decorative */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="text-center lg:text-left">
            <span className="text-brand font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">Reservation</span>
            <h2 className="text-5xl md:text-7xl font-playfair text-gray-950 mb-10 leading-[1.1]">
              Secure Your <span className="italic">Session</span>
            </h2>
            <p className="text-gray-500 font-light mb-12 leading-loose max-w-md mx-auto lg:mx-0">
              Personalized glam requires careful orchestration. Please provide your details to initiate the artistry process.
            </p>
            
            <div className="space-y-6 hidden lg:block">
              <div className="flex items-center gap-4 text-gray-700">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand border border-gray-100 shadow-sm">
                  <Mail size={20} />
                </div>
                <span className="font-light">contact@zaisha.studio</span>
              </div>
              <a 
                href={INSTAGRAM_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 text-gray-700 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-brand border border-gray-100 shadow-sm group-hover:bg-brand group-hover:text-white transition-all">
                  <Instagram size={20} />
                </div>
                <span className="font-light group-hover:text-brand transition-colors">@zaisha_makeup_studio</span>
              </a>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-50">
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-playfair mb-4">Request Received!</h3>
                <p className="text-gray-500 mb-8 font-light leading-relaxed">
                  We've recorded your booking request. To ensure a fast response, please <strong>tap the button below</strong> to notify Zaisha on WhatsApp directly.
                </p>
                <div className="flex flex-col gap-4">
                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Zaisha! I've just requested a booking via your website.\n\n*Name:* ${submittedData?.name || ''}\n*Service:* ${submittedData?.service || ''}\n*Date:* ${submittedData?.date || ''}\n*Time:* ${submittedData?.time || ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-5 bg-[#25d366] text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-green-100 hover:scale-[1.02] transition-all"
                  >
                    <MessageCircle size={18} fill="currentColor" />
                    Notify on WhatsApp
                  </a>
                  <button 
                    onClick={() => { setStatus('idle'); setSubmittedData(null); }}
                    className="w-full py-4 text-gray-400 hover:text-brand font-bold uppercase tracking-widest text-[10px] transition-colors"
                  >
                    Back to Booking
                  </button>
                  <button 
                    onClick={handleCancelLastBooking}
                    className="text-red-300 hover:text-red-500 text-[10px] uppercase tracking-widest font-bold"
                  >
                    Cancel Request
                  </button>
                </div>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="group relative">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none border transition-all font-light ${fieldErrors.name ? 'border-red-200 bg-red-50' : 'border-gray-100 focus:border-brand/30 focus:bg-white'}`}
                    />
                    {fieldErrors.name && <p className="text-red-500 text-[10px] mt-1 pr-4 text-right font-medium">{fieldErrors.name}</p>}
                  </div>

                  <div className="group relative">
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none border transition-all font-light ${fieldErrors.email ? 'border-red-200 bg-red-50' : 'border-gray-100 focus:border-brand/30 focus:bg-white'}`}
                    />
                    {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1 pr-4 text-right font-medium">{fieldErrors.email}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group relative">
                      <input 
                        type="date" 
                        value={formData.date}
                        placeholder="Date"
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={`w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none border transition-all font-light text-gray-400 text-sm ${fieldErrors.date ? 'border-red-200 bg-red-50' : 'border-gray-100 focus:border-brand/30 focus:bg-white'}`}
                      />
                      {fieldErrors.date && <p className="text-red-500 text-[10px] mt-1 pr-4 text-right font-medium">{fieldErrors.date}</p>}
                    </div>

                    <div className="group relative">
                      <select 
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className={`w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none border transition-all font-light appearance-none text-gray-400 text-sm ${fieldErrors.time ? 'border-red-200 bg-red-50' : 'border-gray-100 focus:border-brand/30 focus:bg-white'}`}
                      >
                        <option value="">Time Slot</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                        <option value="07:00 PM">07:00 PM</option>
                        <option value="08:00 PM">08:00 PM</option>
                      </select>
                      {fieldErrors.time && <p className="text-red-500 text-[10px] mt-1 pr-4 text-right font-medium">{fieldErrors.time}</p>}
                    </div>
                  </div>

                  <div className="group relative">
                    <select 
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className={`w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none border transition-all font-light appearance-none text-gray-400 text-sm ${fieldErrors.service ? 'border-red-200 bg-red-50' : 'border-gray-100 focus:border-brand/30 focus:bg-white'}`}
                    >
                      <option value="">Service</option>
                      <option value="Bridal Makeup">Bridal Editorial</option>
                      <option value="Party Makeup">Modern Glam</option>
                      <option value="HD Makeup">Studio Tech</option>
                      <option value="Hair Styling">Couture Styling</option>
                    </select>
                  </div>

                  <textarea 
                    placeholder="Specific Requirements (Optional)" 
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none border border-gray-100 focus:border-brand/30 focus:bg-white transition-all h-32 resize-none font-light"
                  ></textarea>
                </div>
                
                {status === 'error' && (
                  <p className="text-red-500 text-[10px] font-medium text-center">{message}</p>
                )}

                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-6 bg-brand text-white rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-xl shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    'Synchronizing...'
                  ) : (
                    <>
                      <MessageCircle size={18} fill="currentColor" />
                      Send to Artist
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onAdmin }: { onAdmin: () => void }) => {
  return (
    <footer className="bg-gray-950 py-24 md:py-32 px-4 md:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-playfair mb-6">Zaisha Makeup Studio</h2>
            <p className="text-gray-400 font-light max-w-sm leading-loose mb-6">
              Architecting timeless beauty for your most cinematic moments. Based in Lucknow, available globally for bridal and editorial bookings.
            </p>
            <div className="space-y-2 text-[11px] uppercase tracking-widest text-gray-600">
              <p>12, Hazratganj, Lucknow</p>
              <p>Uttar Pradesh 226001, India</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] font-bold mb-8 text-brand">Connect</h4>
            <div className="flex flex-col gap-4 font-light text-gray-400">
               <a 
                 href={INSTAGRAM_URL} 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="hover:text-brand transition-colors"
               >
                 Instagram
               </a>
               <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">WhatsApp</a>
               <a href="mailto:contact@zaisha.studio" className="hover:text-brand transition-colors">Email Us</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.3em] font-bold mb-8 text-brand">Navigation</h4>
            <div className="flex flex-col gap-4 font-light text-gray-400">
               <a href="#" className="hover:text-brand transition-colors">Home</a>
               <a href="#services" className="hover:text-brand transition-colors">Services</a>
               <a href="#booking" className="hover:text-brand transition-colors">Reserve</a>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
            © {new Date().getFullYear()} Zaisha Makeup Studio • Bespoke Beauty Excellence
          </span>
          <button 
            onClick={onAdmin}
            className="text-[10px] uppercase tracking-[0.2em] text-gray-700 hover:text-brand transition-colors flex items-center gap-2"
          >
            <LayoutDashboard size={12} /> Systems Access
          </button>
        </div>
      </div>
    </footer>
  );
};

const WhatsAppButton = () => {
  return (
    <motion.a 
      href={`https://wa.me/${WHATSAPP_NUMBER}`} 
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 w-16 h-16 bg-[#25d366] text-white rounded-full flex items-center justify-center shadow-2xl z-[100]"
    >
      <MessageCircle size={32} fill="white" />
    </motion.a>
  );
};

export default function App() {
  const [view, setView] = useState<'public' | 'login' | 'admin'>('public');
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }, [token]);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    setView('admin');
  };

  const handleLogout = () => {
    setToken(null);
    setView('public');
  };

  if (view === 'login') {
    return <AdminLogin onLogin={handleLogin} onBack={() => setView('public')} />;
  }

  if (view === 'admin') {
    if (!token) {
      setView('login');
      return null;
    }
    return <AdminDashboard token={token} onLogout={handleLogout} onBack={() => setView('public')} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Location />
      <Booking />
      <Footer onAdmin={() => setView('login')} />
      <WhatsAppButton />
    </div>
  );
}
