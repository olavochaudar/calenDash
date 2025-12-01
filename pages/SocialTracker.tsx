
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { Button } from '../components/Button';
import { 
    Instagram, TrendingUp, Users, Heart, MessageCircle, 
    Share2, Activity, Link2, CheckCircle2, LogOut, Loader2, CalendarClock, Image as ImageIcon, Edit, Save, X, RotateCcw, Check, Trash2, Calendar, Clock, Wifi, WifiOff, Eye, BarChart2, AlertTriangle, FileText, Download, PieChart, RefreshCcw, AtSign, Globe
} from 'lucide-react';

// Dados Reais Aproximados para contas populares (Simulação de API)
const KNOWN_INFLUENCERS: Record<string, any> = {
    'neymarjr': { followers: 219000000, following: 1800, posts: 5600, engagement: 2.1 },
    'anitta': { followers: 65200000, following: 2400, posts: 4100, engagement: 1.8 },
    'cristiano': { followers: 620000000, following: 580, posts: 3600, engagement: 3.5 },
    'virginia': { followers: 46000000, following: 1200, posts: 2500, engagement: 5.2 },
    'whinderssonnunes': { followers: 59000000, following: 1500, posts: 2900, engagement: 4.1 },
    'tatawerneck': { followers: 57000000, following: 2100, posts: 4500, engagement: 3.9 },
    'maisa': { followers: 48000000, following: 1300, posts: 1200, engagement: 2.5 },
    'larissamanoela': { followers: 54000000, following: 1600, posts: 3100, engagement: 2.2 },
    'casimiro': { followers: 4500000, following: 900, posts: 1500, engagement: 12.5 }, // Alto engajamento
    'netflixbrasil': { followers: 32000000, following: 150, posts: 8000, engagement: 1.1 },
    'nubank': { followers: 3100000, following: 50, posts: 4200, engagement: 0.9 },
};

// Interface for Scheduled Posts
interface ScheduledPost {
    id: string;
    caption: string;
    media?: string;
    date: string;
    time: string;
    platform: 'instagram' | 'tiktok';
    createdAt: string;
}

// Helper to generate consistent pseudo-random numbers from a string seed
const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
};

const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
};

export const SocialTracker: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | null>(null);
  const [username, setUsername] = useState('@usuario');
  const [profileImage, setProfileImage] = useState('');
  const [extractedPreview, setExtractedPreview] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // PDF Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Dynamic Real-feel Stats
  const [stats, setStats] = useState({
      followers: 0,
      following: 0,
      posts: 0,
      engagement: 0.0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      avgReach: 0,
      avgImpressions: 0,
      audience: {
          male: 50,
          female: 50,
          ages: [] as { name: string, value: number }[]
      }
  });
  const [chartData, setChartData] = useState<any[]>([]);

  // Editing Buffer State
  const [editingStats, setEditingStats] = useState<typeof stats | null>(null);
  const [editingChartData, setEditingChartData] = useState<any[]>([]);

  // Scheduled Posts State
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  
  // New Post Form State
  const [postCaption, setPostCaption] = useState('');
  const [postDate, setPostDate] = useState('');
  const [postTime, setPostTime] = useState('');
  const [postMedia, setPostMedia] = useState('');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Network Detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persistence Logic
  useEffect(() => {
    const savedConnection = localStorage.getItem('calendash_social_conn');
    if (savedConnection) {
        const data = JSON.parse(savedConnection);
        // Only restore if valid data exists
        if (data.username && data.platform) {
            setUrl(data.url || '');
            setPlatform(data.platform);
            setUsername(data.username);
            setProfileImage(data.profileImage);
            setScheduledPosts(data.scheduledPosts || []);
            
            // Check if there are saved custom stats/chart data, otherwise generate
            if (data.customStats) {
                setStats(data.customStats);
                setChartData(data.customChartData);
            } else {
                generateRealFeelData(data.username);
            }
            setIsConnected(true);
        }
    }
  }, []);

  // Update localStorage helper
  const updateLocalStorage = (newData: any) => {
      const current = localStorage.getItem('calendash_social_conn');
      const parsed = current ? JSON.parse(current) : {};
      localStorage.setItem('calendash_social_conn', JSON.stringify({ ...parsed, ...newData }));
  };

  const generateRealFeelData = (userHandle: string, updateState = true) => {
      const cleanHandle = userHandle.replace('@', '').toLowerCase().trim();
      const knownProfile = KNOWN_INFLUENCERS[cleanHandle];
      const seed = hashCode(cleanHandle);
      
      let baseFollowers = 0;
      let following = 0;
      let posts = 0;
      let engagementRate = 0;

      if (knownProfile) {
          // Use Real Data
          baseFollowers = knownProfile.followers;
          following = knownProfile.following;
          posts = knownProfile.posts;
          engagementRate = knownProfile.engagement;
      } else {
          // Simulate Realistic Data based on seed
          if (seed % 100 < 5) baseFollowers = 1000000 + (seed % 5000000); // 1M - 6M
          else if (seed % 100 < 20) baseFollowers = 100000 + (seed % 900000); // 100k - 1M
          else if (seed % 100 < 50) baseFollowers = 10000 + (seed % 90000); // 10k - 100k
          else baseFollowers = 100 + (seed % 5000); // Normal user
          
          following = (seed % 2000) + 50;
          posts = (seed % 500) + 12;
          engagementRate = 1 + (seed % 60) / 10;
      }
      
      const avgLikes = Math.floor(baseFollowers * (engagementRate / 100));
      const avgComments = Math.floor(avgLikes * 0.03);
      const avgShares = Math.floor(avgLikes * 0.015);

      // Generate Reach and Impressions
      const reachFactor = 0.15 + (seed % 20) / 100; // 0.15 to 0.35
      const avgReach = Math.floor(baseFollowers * reachFactor);
      const avgImpressions = Math.floor(avgReach * (1.2 + (seed % 30) / 100));

      // Audience Generation
      const genderSeed = seed % 100;
      let femalePerc = 50;
      if (genderSeed < 30) femalePerc = 65 + (seed % 20); // Mostly female
      else if (genderSeed > 70) femalePerc = 20 + (seed % 20); // Mostly male
      else femalePerc = 40 + (seed % 20); // Balanced
      // Clamp between 10 and 90
      femalePerc = Math.max(10, Math.min(90, femalePerc));
      const malePerc = 100 - femalePerc;

      const ageGroupsRaw = [
          { name: '13-17', value: 10 + (seed % 15) },
          { name: '18-24', value: 30 + (seed % 20) },
          { name: '25-34', value: 25 + (seed % 15) },
          { name: '35-44', value: 10 + (seed % 10) },
          { name: '45+', value: 5 + (seed % 5) }
      ];
      // Normalize to 100%
      const totalAge = ageGroupsRaw.reduce((a, b) => a + b.value, 0);
      const ageDistribution = ageGroupsRaw.map(g => ({ ...g, value: Math.round((g.value / totalAge) * 100) }));

      const newStats = {
          followers: baseFollowers,
          following: following,
          posts: posts,
          engagement: engagementRate,
          avgLikes,
          avgComments,
          avgShares,
          avgReach,
          avgImpressions,
          audience: {
              male: malePerc,
              female: femalePerc,
              ages: ageDistribution
          }
      };

      // Generate Chart Data Scaling with Followers
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
      const graph = months.map((m, i) => {
          // Add some randomness to growth curve
          const randomGrowth = (seed + i) % 10; // 0-9
          const trendFactor = 0.9 + (i * 0.05) + (randomGrowth / 100); 
          
          return {
              name: m,
              followers: Math.floor(baseFollowers * trendFactor),
              engagement: engagementRate + (Math.sin(i + seed) * 0.5)
          };
      });

      if (updateState) {
          setStats(newStats);
          setChartData(graph);
      }
      
      return { stats: newStats, chartData: graph };
  };

  const extractIdentity = (input: string) => {
      const clean = input.trim();
      let platform: 'instagram' | 'tiktok' | null = null;
      let username = '';

      if (clean.includes('instagram.com')) {
          platform = 'instagram';
          const parts = clean.split('instagram.com/');
          if (parts[1]) {
              username = parts[1].split('/')[0].split('?')[0];
          }
      } else if (clean.includes('tiktok.com')) {
          platform = 'tiktok';
          const parts = clean.split('tiktok.com/');
          if (parts[1]) {
               let userPart = parts[1].split('?')[0];
               if (userPart.includes('@')) userPart = userPart.split('@')[1];
               username = userPart.replace('/', '');
          }
      } else if (clean.startsWith('@')) {
          username = clean.substring(1);
          platform = 'instagram'; // Default guess
      } else {
          // Fallback: assume it's just a username if no domain
          if (!clean.includes('.') && !clean.includes('/')) {
             username = clean;
             platform = 'instagram';
          }
      }

      return { platform, username };
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setUrl(val);
      const { platform: extractedPlat, username: extractedUser } = extractIdentity(val);
      
      if (!isConnected) {
          if (extractedPlat) setPlatform(extractedPlat);
          if (extractedUser) setExtractedPreview(extractedUser);
      }
  };

  const handleConnect = (e: React.FormEvent) => {
      e.preventDefault();
      if (!isOnline) return;
      
      // We prioritize values in the fields (platform state and extractedPreview) 
      // in case the user manually edited them after pasting the URL.
      if (!platform && !extractedPreview) return;
      
      setLoading(true);
      
      const finalUser = extractedPreview;
      const finalPlatform = platform || 'instagram';

      setTimeout(() => {
          const finalUsername = '@' + finalUser;
          
          // Use unavatar with fallback
          const realProfileImage = finalPlatform === 'instagram' 
            ? `https://unavatar.io/instagram/${finalUser}`
            : `https://unavatar.io/${finalUser}`; 

          setPlatform(finalPlatform);
          setUsername(finalUsername);
          setProfileImage(realProfileImage);
          const generated = generateRealFeelData(finalUsername); // Generate unique stats
          
          // Trigger Success Animation
          setLoading(false);
          setShowSuccessAnimation(true);
          setIsConnected(true);
          setExtractedPreview('');
          setUrl(''); // Clear URL input

          updateLocalStorage({
              url: `https://${finalPlatform}.com/${finalUser}`,
              platform: finalPlatform,
              username: finalUsername,
              profileImage: realProfileImage,
              customStats: generated.stats,
              customChartData: generated.chartData,
              scheduledPosts: scheduledPosts
          });

          // Hide animation after 2.5s
          setTimeout(() => {
              setShowSuccessAnimation(false);
          }, 2500);

      }, 1500);
  };

  const handleDisconnect = () => {
      setIsConnected(false);
      setUrl('');
      setPlatform(null);
      setUsername('@usuario');
      setProfileImage('');
      setExtractedPreview('');
      setStats({
          followers: 0,
          following: 0,
          posts: 0,
          engagement: 0,
          avgLikes: 0,
          avgComments: 0,
          avgShares: 0,
          avgReach: 0,
          avgImpressions: 0,
          audience: { male: 50, female: 50, ages: [] }
      });
      setChartData([]);
      setScheduledPosts([]);
      localStorage.removeItem('calendash_social_conn');
  };

  const handleExportReport = () => {
      setIsExporting(true);
      setExportSuccess(false);
      
      // Simulate generation
      setTimeout(() => {
          setIsExporting(false);
          setExportSuccess(true);
          setTimeout(() => setExportSuccess(false), 3000);
      }, 2000);
  };

  // Editor Handlers
  const handleOpenEditor = () => {
      setEditingStats({ ...stats });
      setEditingChartData(JSON.parse(JSON.stringify(chartData)));
      setIsEditorOpen(true);
  };

  const handleEditorStatChange = (key: keyof typeof stats, value: string) => {
      if (!editingStats) return;
      const numValue = parseFloat(value);
      setEditingStats(prev => prev ? ({ ...prev, [key]: isNaN(numValue) ? 0 : numValue }) : null);
  };

  // Audience Handlers
  const handleAudienceGenderChange = (femaleVal: string) => {
      if (!editingStats) return;
      let val = parseFloat(femaleVal);
      if (val < 0) val = 0;
      if (val > 100) val = 100;
      setEditingStats({
          ...editingStats,
          audience: {
              ...editingStats.audience,
              female: val,
              male: 100 - val
          }
      });
  };

  const handleAudienceAgeChange = (index: number, val: string) => {
       if (!editingStats) return;
       const newAges = [...editingStats.audience.ages];
       newAges[index] = { ...newAges[index], value: parseFloat(val) || 0 };
       setEditingStats({
           ...editingStats,
           audience: {
               ...editingStats.audience,
               ages: newAges
           }
       });
  };

  const handleEditorChartChange = (index: number, key: string, value: string) => {
      const newData = [...editingChartData];
      newData[index] = { ...newData[index], [key]: parseFloat(value) || 0 };
      setEditingChartData(newData);
  };
  
  const saveCustomData = () => {
      if (editingStats) {
          setStats(editingStats);
          setChartData(editingChartData);
          updateLocalStorage({
              customStats: editingStats,
              customChartData: editingChartData
          });
      }
      setIsEditorOpen(false);
  };
  
  const resetToSimulation = () => {
      if (confirm('Tem certeza? Isso irá descartar todas as edições manuais e restaurar os dados simulados originais.')) {
          const generated = generateRealFeelData(username, false);
          setEditingStats(generated.stats);
          setEditingChartData(generated.chartData);
      }
  };

  // Schedule Logic
  const handlePostMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setPostMedia(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSchedulePost = () => {
      if (!postCaption && !postMedia) return;
      if (!postDate || !postTime) return;

      const newPost: ScheduledPost = {
          id: Math.random().toString(36).substr(2, 9),
          caption: postCaption,
          media: postMedia,
          date: postDate,
          time: postTime,
          platform: platform || 'instagram',
          createdAt: new Date().toISOString()
      };

      const updatedPosts = [...scheduledPosts, newPost];
      
      // Sort by date/time
      updatedPosts.sort((a, b) => {
          return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
      });

      setScheduledPosts(updatedPosts);
      updateLocalStorage({ scheduledPosts: updatedPosts });
      
      // Reset Form
      setPostCaption('');
      setPostDate('');
      setPostTime('');
      setPostMedia('');
      setIsScheduleModalOpen(false);
  };

  const handleDeletePost = (id: string) => {
      if (window.confirm("Tem certeza que deseja excluir este post agendado?")) {
        const updated = scheduledPosts.filter(p => p.id !== id);
        setScheduledPosts(updated);
        updateLocalStorage({ scheduledPosts: updated });
      }
  };

  const TikTokIcon = () => (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" className="text-white">
          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
      </svg>
  );

  return (
    <div className="space-y-8 pb-10">
      
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn">
              {/* Richer CSS Confetti */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(70)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-20px`,
                            animation: `confetti-fall ${1.5 + Math.random() * 2.5}s linear forwards`,
                            animationDelay: `${Math.random() * 1.5}s`
                        }}
                      >
                          <div 
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{
                                backgroundColor: ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7', '#ec4899'][Math.floor(Math.random() * 6)],
                                transform: `rotate(${Math.random() * 360}deg)`
                            }}
                          />
                      </div>
                  ))}
              </div>

              <div className="flex flex-col items-center animate-slideUp relative z-10">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_#22c55e] animate-bounce">
                      <Check size={48} className="text-white" strokeWidth={4} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2 text-center animate-fadeIn" style={{animationDelay: '0.2s'}}>Conectado com Sucesso!</h2>
                  <p className="text-gray-400 text-center animate-fadeIn" style={{animationDelay: '0.4s'}}>Sincronizando dados históricos...</p>
              </div>
              <style>{`
                @keyframes confetti-fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    25% { transform: translateY(25vh) rotate(90deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
              `}</style>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <div className="flex flex-wrap items-center gap-3">
               <h1 className="text-3xl font-bold text-white mb-2">Monitoramento Social</h1>
               <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                        <AlertTriangle size={10} /> Beta - Em Desenvolvimento
                    </span>
                    {!isOnline && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-xs font-bold animate-pulse">
                            <WifiOff size={14} /> Modo Offline
                        </div>
                    )}
                    {isOnline && isConnected && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-xs font-bold">
                            <Wifi size={14} /> Online
                        </div>
                    )}
               </div>
           </div>
           <p className="text-gray-400">
             Conecte perfis para acompanhar crescimento e engajamento em tempo real.
           </p>
        </div>
        {isConnected && !showSuccessAnimation && (
            <div className="flex gap-3">
                <Button 
                    variant="secondary" 
                    onClick={handleExportReport} 
                    className="h-9 px-4 hidden md:flex" 
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <>
                            <Loader2 size={14} className="mr-2 animate-spin" /> Gerando PDF...
                        </>
                    ) : exportSuccess ? (
                        <span className="text-green-500 flex items-center"><Check size={14} className="mr-2"/> Baixado!</span>
                    ) : (
                        <>
                            <FileText size={14} className="mr-2" /> Exportar Relatório
                        </>
                    )}
                </Button>
                <Button variant="secondary" onClick={handleOpenEditor} className="h-9 px-4">
                    <Edit size={14} className="mr-2" /> Editar Métricas
                </Button>
                <Button onClick={() => setIsScheduleModalOpen(true)}>
                    <CalendarClock size={16} className="mr-2" /> Agendar Post
                </Button>
                <Button variant="danger" onClick={handleDisconnect} className="text-xs h-9 px-4 shadow-red-500/20 shadow-lg">
                    <LogOut size={14} className="mr-2" /> Desconectar
                </Button>
            </div>
        )}
      </div>

      {!isConnected ? (
          <div className="max-w-2xl mx-auto mt-10 animate-fadeIn">
              {/* Connection Box Code - Same as before */}
              <div className="bg-brand-surface border border-gray-800 rounded-2xl p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"></div>
                  
                  <div className="flex justify-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg transform -rotate-6 transition-all duration-300 ${
                          platform === 'instagram' ? 'bg-pink-500/10 text-pink-500 border-pink-500/50 scale-110' : 'bg-gray-900 text-gray-600 border-gray-800'
                      }`}>
                          <Instagram size={28} />
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg transform rotate-6 transition-all duration-300 ${
                           platform === 'tiktok' ? 'bg-[#00f2ea]/10 text-[#00f2ea] border-[#00f2ea]/50 scale-110' : 'bg-gray-900 text-gray-600 border-gray-800'
                      }`}>
                          <TikTokIcon />
                      </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3">Conectar Perfil Real</h2>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      Cole o link do perfil do Instagram ou TikTok. Nós identificaremos a conta automaticamente.
                  </p>

                  <form onSubmit={handleConnect} className="flex flex-col gap-4 max-w-md mx-auto">
                      <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-500 transition-colors">
                                <Link2 size={20} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="ex: instagram.com/neymarjr"
                                value={url}
                                onChange={handleUrlChange}
                                disabled={!isOnline}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                                required
                            />
                        </div>

                        {/* Separate Fields for Auto-population / Manual Correction */}
                        <div className="grid grid-cols-2 gap-4">
                             <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <Globe size={16} />
                                </div>
                                <select 
                                    value={platform || ''} 
                                    onChange={(e) => setPlatform(e.target.value as 'instagram' | 'tiktok')}
                                    className="w-full bg-black/30 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                >
                                    <option value="" disabled>Plataforma</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="tiktok">TikTok</option>
                                </select>
                             </div>
                             
                             <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    <AtSign size={16} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Usuário"
                                    value={extractedPreview}
                                    onChange={(e) => setExtractedPreview(e.target.value)}
                                    className="w-full bg-black/30 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                             </div>
                        </div>

                        {!isOnline && (
                            <div className="flex items-center gap-2 justify-center text-sm font-medium animate-fadeIn bg-red-500/10 py-1 rounded-lg border border-red-500/20 text-red-400">
                                <WifiOff size={14} /> Conexão necessária para buscar perfil
                            </div>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        isLoading={loading}
                        disabled={(!platform && !url && !extractedPreview) || !isOnline}
                        className="w-full py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0"
                      >
                          {loading ? 'Buscando Dados...' : 'Conectar Conta'}
                      </Button>
                  </form>
                  <p className="text-xs text-gray-600 mt-4">
                      *Usamos APIs públicas para identificar o avatar e o usuário. Dados privados (insights) são simulados nesta demonstração.
                  </p>
              </div>
          </div>
      ) : (
          <div className="space-y-6 animate-slideUp">
              
              {/* Profile Header */}
              <div className="bg-brand-surface border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                  {/* Background blur effect for profile */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-5 rounded-full filter blur-3xl pointer-events-none"></div>

                  {/* Disconnect Button (In-Card) */}
                  <div className="absolute top-4 right-4 z-20 md:hidden">
                       <button onClick={handleDisconnect} className="text-gray-500 hover:text-red-500 p-2 bg-gray-900 rounded-full border border-gray-700">
                           <LogOut size={18} />
                       </button>
                  </div>
                  <div className="absolute top-6 right-6 z-20 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                        onClick={handleDisconnect}
                        className="p-2 bg-black/40 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-full transition-colors border border-transparent hover:border-red-500/30"
                        title="Desconectar Conta"
                     >
                        <LogOut size={20} />
                     </button>
                  </div>

                  <div className="flex items-center gap-6 relative z-10">
                      <div className={`p-[3px] rounded-full ${platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' : 'bg-gradient-to-tr from-[#00f2ea] to-[#ff0050]'}`}>
                          <div className="p-1 bg-black rounded-full overflow-hidden w-24 h-24 relative">
                              <img 
                                src={profileImage || "https://via.placeholder.com/150"} 
                                alt={username} 
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                    // Fallback to UI Avatars if Unavatar fails, but use proper name
                                    const cleanName = username.replace('@','');
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${cleanName}&background=random&color=fff`;
                                }}
                              />
                          </div>
                      </div>
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              <h2 className="text-3xl font-bold text-white tracking-tight">{username}</h2>
                              {platform === 'instagram' ? <Instagram size={22} className="text-pink-500" /> : <TikTokIcon />}
                              {!isOnline ? (
                                  <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/30">CACHE</span>
                              ) : (
                                  <CheckCircle2 size={18} className="text-blue-500" />
                              )}
                          </div>
                          <p className="text-gray-400 max-w-md text-sm">
                              {!isOnline ? 'Visualizando dados salvos localmente.' : 'Conta conectada e monitorada.'}
                          </p>
                      </div>
                  </div>
                  
                  <div className="flex gap-6 relative z-10 mt-4 md:mt-0">
                      <div className="text-center px-6 border-r border-gray-800">
                          <p className="text-3xl font-bold text-white">{formatNumber(stats.followers)}</p>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Seguidores</p>
                      </div>
                      <div className="text-center px-6 border-r border-gray-800">
                          <p className="text-3xl font-bold text-white">{formatNumber(stats.following)}</p>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Seguindo</p>
                      </div>
                      <div className="text-center px-6">
                          <p className="text-3xl font-bold text-white">{stats.posts}</p>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Posts</p>
                      </div>
                  </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-brand-surface border border-gray-800 p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-gray-400 text-xs font-bold uppercase">Engajamento</p>
                          <Activity size={18} className="text-green-500" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">{stats.engagement.toFixed(1)}%</h3>
                      <span className="text-green-500 text-xs flex items-center gap-1">
                          <TrendingUp size={12}/> Saudável
                      </span>
                  </div>
                  <div className="bg-brand-surface border border-gray-800 p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-gray-400 text-xs font-bold uppercase">Média Likes</p>
                          <Heart size={18} className="text-pink-500" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">{formatNumber(stats.avgLikes)}</h3>
                      <span className="text-gray-500 text-xs">por post</span>
                  </div>
                  <div className="bg-brand-surface border border-gray-800 p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-gray-400 text-xs font-bold uppercase">Média Comentários</p>
                          <MessageCircle size={18} className="text-blue-500" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">{formatNumber(stats.avgComments)}</h3>
                      <span className="text-gray-500 text-xs">por post</span>
                  </div>
                  <div className="bg-brand-surface border border-gray-800 p-5 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-gray-400 text-xs font-bold uppercase">Compartilhamentos</p>
                          <Share2 size={18} className="text-purple-500" />
                      </div>
                      <h3 className="text-3xl font-bold text-white">{formatNumber(stats.avgShares)}</h3>
                      <span className="text-green-500 text-xs flex items-center gap-1">
                          <TrendingUp size={12}/> Alta
                      </span>
                  </div>
              </div>

              {/* Audience Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Gender Stats */}
                 <div className="bg-brand-surface border border-gray-800 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                        <PieChart size={18} className="text-indigo-500" /> Insights de Gênero
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                         <span className="text-xs text-blue-400 font-bold">Homens {stats.audience.male}%</span>
                         <span className="text-xs text-pink-400 font-bold">Mulheres {stats.audience.female}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
                        <div style={{ width: `${stats.audience.male}%` }} className="bg-blue-500 h-full"></div>
                        <div style={{ width: `${stats.audience.female}%` }} className="bg-pink-500 h-full"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Baseado em engajamento e seguidores.
                    </p>
                 </div>

                 {/* Age Stats */}
                 <div className="md:col-span-2 bg-brand-surface border border-gray-800 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Users size={18} className="text-indigo-500" /> Faixa Etária
                    </h3>
                    <div className="h-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.audience.ages}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                    cursor={{fill: '#374151', opacity: 0.2}}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
              </div>

              {/* Detailed Reach Analytics Section */}
              <div className="bg-brand-surface border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                       <BarChart2 size={20} className="text-indigo-500" /> Análise de Alcance e Visibilidade
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Reach & Impressions Cards */}
                      <div className="space-y-4">
                          <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                                  <Users size={24} />
                              </div>
                              <div className="flex-1">
                                  <p className="text-gray-500 text-xs font-bold uppercase">Alcance Estimado (30d)</p>
                                  <h4 className="text-2xl font-bold text-white">{formatNumber(stats.avgReach)}</h4>
                                  <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2">
                                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-1">~30% da base de seguidores</p>
                              </div>
                          </div>
                          
                          <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg">
                                  <Eye size={24} />
                              </div>
                              <div className="flex-1">
                                  <p className="text-gray-500 text-xs font-bold uppercase">Impressões Totais (30d)</p>
                                  <h4 className="text-2xl font-bold text-white">{formatNumber(stats.avgImpressions)}</h4>
                                  <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2">
                                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
                                  </div>
                                  <p className="text-[10px] text-gray-500 mt-1">Freq. Média: 1.4x por usuário</p>
                              </div>
                          </div>
                      </div>

                      {/* Interaction Breakdown */}
                      <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-xl">
                          <h4 className="text-white text-sm font-bold mb-4">Eficiência de Conteúdo</h4>
                          <div className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">Likes por 1k Alcance</span>
                                  <span className="text-white font-bold">{((stats.avgLikes / (stats.avgReach / 100)) || 0).toFixed(1)}</span>
                              </div>
                              <div className="w-full bg-gray-800 h-1.5 rounded-full">
                                  <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                              </div>

                              <div className="flex items-center justify-between text-sm pt-2">
                                  <span className="text-gray-400">Comentários por 1k Alcance</span>
                                  <span className="text-white font-bold">{((stats.avgComments / (stats.avgReach / 100)) || 0).toFixed(1)}</span>
                              </div>
                              <div className="w-full bg-gray-800 h-1.5 rounded-full">
                                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm pt-2">
                                  <span className="text-gray-400">Taxa de Conversão (Perfil)</span>
                                  <span className="text-white font-bold">1.2%</span>
                              </div>
                              <div className="w-full bg-gray-800 h-1.5 rounded-full">
                                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Growth Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-brand-surface border border-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                          <TrendingUp size={18} className="text-indigo-500" /> Crescimento de Seguidores
                      </h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={platform === 'tiktok' ? '#00f2ea' : '#833AB4'} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={platform === 'tiktok' ? '#00f2ea' : '#833AB4'} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number) => [formatNumber(value), 'Seguidores']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="followers" 
                                    name="Seguidores"
                                    stroke={platform === 'tiktok' ? '#00f2ea' : '#833AB4'} 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorFollowers)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                      </div>
                  </div>

                  <div className="bg-brand-surface border border-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-6">Top Hashtags</h3>
                      <div className="space-y-4">
                          {[
                              { tag: '#viral', count: formatNumber(stats.followers * 0.05), trend: 'up' },
                              { tag: '#fyp', count: formatNumber(stats.followers * 0.02), trend: 'up' },
                              { tag: `#${username.replace('@','')}`, count: formatNumber(stats.followers * 0.01), trend: 'up' },
                              { tag: '#brasil', count: '3.5M', trend: 'up' },
                              { tag: '#lifestyle', count: '2.1M', trend: 'neutral' },
                          ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                                  <span className="text-gray-300 font-medium">{item.tag}</span>
                                  <div className="flex items-center gap-3">
                                      <span className="text-xs text-gray-500">{item.count}</span>
                                      {item.trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                                      {item.trend === 'down' && <TrendingUp size={14} className="text-red-500 rotate-180" />}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
              
              {/* Scheduled Posts Queue */}
              <div className="bg-brand-surface border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <CalendarClock size={20} className="text-indigo-500" /> Fila de Publicação
                      </h3>
                      <span className="text-xs bg-gray-900 text-gray-400 px-3 py-1 rounded-full border border-gray-800">
                          {scheduledPosts.length} agendados
                      </span>
                  </div>

                  {scheduledPosts.length === 0 ? (
                      <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/20">
                          <CalendarClock size={40} className="text-gray-700 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Nenhum post agendado.</p>
                          <Button variant="ghost" onClick={() => setIsScheduleModalOpen(true)} className="mt-2 text-indigo-400 hover:text-white">
                              Agendar Primeiro Post
                          </Button>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {scheduledPosts.map((post) => (
                              <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group hover:border-indigo-500/30 transition-all relative">
                                  <div className="h-32 bg-gray-950 relative overflow-hidden flex items-center justify-center">
                                      {post.media ? (
                                          <img src={post.media} alt="Post media" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                      ) : (
                                          <ImageIcon size={30} className="text-gray-700" />
                                      )}
                                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg text-white">
                                          {post.platform === 'instagram' ? <Instagram size={14} /> : <TikTokIcon />}
                                      </div>
                                  </div>
                                  <div className="p-4">
                                      <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold mb-2">
                                          <Calendar size={12} /> {new Date(post.date).toLocaleDateString('pt-BR')} 
                                          <span className="text-gray-600">|</span> 
                                          <Clock size={12} /> {post.time}
                                      </div>
                                      <p className="text-sm text-gray-300 line-clamp-2 mb-3 h-10">
                                          {post.caption || <span className="text-gray-600 italic">Sem legenda...</span>}
                                      </p>
                                      <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Agendado</span>
                                          <button 
                                            onClick={() => handleDeletePost(post.id)}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                            title="Remover"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

          </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && editingStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit size={20} className="text-indigo-500" /> Editor de Métricas
                    </h2>
                    <button 
                        onClick={() => setIsEditorOpen(false)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Section 1: General Stats */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Dados do Perfil</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Seguidores</label>
                                <input 
                                    type="number" 
                                    value={editingStats.followers}
                                    onChange={(e) => handleEditorStatChange('followers', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Seguindo</label>
                                <input 
                                    type="number" 
                                    value={editingStats.following}
                                    onChange={(e) => handleEditorStatChange('following', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Posts</label>
                                <input 
                                    type="number" 
                                    value={editingStats.posts}
                                    onChange={(e) => handleEditorStatChange('posts', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Engagement & Averages */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Engajamento & Médias</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Engajamento (%)</label>
                                <input 
                                    type="number"
                                    step="0.1" 
                                    value={editingStats.engagement}
                                    onChange={(e) => handleEditorStatChange('engagement', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Média Likes</label>
                                <input 
                                    type="number" 
                                    value={editingStats.avgLikes}
                                    onChange={(e) => handleEditorStatChange('avgLikes', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Média Comentários</label>
                                <input 
                                    type="number" 
                                    value={editingStats.avgComments}
                                    onChange={(e) => handleEditorStatChange('avgComments', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Compartilhamentos</label>
                                <input 
                                    type="number" 
                                    value={editingStats.avgShares}
                                    onChange={(e) => handleEditorStatChange('avgShares', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 3: Reach & Visibility */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Alcance & Visibilidade</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Alcance Estimado (Avg)</label>
                                <input 
                                    type="number" 
                                    value={editingStats.avgReach}
                                    onChange={(e) => handleEditorStatChange('avgReach', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                             <div>
                                <label className="block text-xs text-gray-500 mb-1">Impressões Totais (Avg)</label>
                                <input 
                                    type="number" 
                                    value={editingStats.avgImpressions}
                                    onChange={(e) => handleEditorStatChange('avgImpressions', e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Chart Data */}
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dados do Gráfico (Mensal)</h3>
                             <button onClick={resetToSimulation} className="text-xs text-indigo-400 hover:text-white flex items-center gap-1">
                                 <RotateCcw size={12} /> Restaurar Padrão
                             </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {editingChartData.map((data, idx) => (
                                <div key={idx} className="bg-gray-800/50 p-2 rounded-lg border border-gray-800 relative group">
                                    <button 
                                        onClick={() => handleEditorChartChange(idx, 'followers', '0')}
                                        className="absolute -top-1 -right-1 bg-gray-700 hover:bg-red-500 hover:text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Zerar Mês"
                                    >
                                        <X size={10} />
                                    </button>
                                    <p className="text-center font-bold text-indigo-400 mb-2">{data.name}</p>
                                    
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-[10px] text-gray-500 block">Seguidores</label>
                                            <input 
                                                type="number"
                                                value={data.followers}
                                                onChange={(e) => handleEditorChartChange(idx, 'followers', e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="Seguidores"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 block">Engaj. (%)</label>
                                            <input 
                                                type="number"
                                                step="0.1"
                                                value={data.engagement || 0}
                                                onChange={(e) => handleEditorChartChange(idx, 'engagement', e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="%"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 5: Audience Data */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Demografia da Audiência</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Gender Edit */}
                            <div className="bg-gray-800/50 border border-gray-800 p-4 rounded-xl">
                                <label className="block text-xs font-bold text-gray-400 mb-3">Distribuição de Gênero (%)</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-pink-400 mb-1 block">Mulheres</label>
                                        <input 
                                            type="number" 
                                            min="0" max="100"
                                            value={editingStats.audience.female}
                                            onChange={(e) => handleAudienceGenderChange(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white text-sm focus:ring-1 focus:ring-pink-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-blue-400 mb-1 block">Homens (Auto)</label>
                                        <div className="w-full bg-gray-900/50 border border-gray-800 rounded p-2 text-gray-400 text-sm cursor-not-allowed">
                                            {editingStats.audience.male}%
                                        </div>
                                    </div>
                                    <div className="flex items-end">
                                        <button 
                                            onClick={() => handleAudienceGenderChange('50')}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300"
                                            title="Resetar 50/50"
                                        >
                                            <RefreshCcw size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3 w-full bg-gray-700 h-2 rounded-full overflow-hidden flex">
                                    <div style={{ width: `${editingStats.audience.male}%` }} className="bg-blue-500 h-full transition-all"></div>
                                    <div style={{ width: `${editingStats.audience.female}%` }} className="bg-pink-500 h-full transition-all"></div>
                                </div>
                            </div>

                            {/* Age Edit */}
                            <div className="bg-gray-800/50 border border-gray-800 p-4 rounded-xl">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-xs font-bold text-gray-400">Faixa Etária (Valores)</label>
                                    <button 
                                        onClick={() => {
                                            const resetAges = editingStats.audience.ages.map(a => ({...a, value: 0}));
                                            setEditingStats({...editingStats, audience: {...editingStats.audience, ages: resetAges}});
                                        }}
                                        className="text-[10px] text-red-400 hover:text-white flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded"
                                    >
                                        <Trash2 size={10} /> Zerar Tudo
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {editingStats.audience.ages.map((age, idx) => (
                                        <div key={idx}>
                                            <label className="text-[10px] text-gray-500 block mb-1">{age.name}</label>
                                            <input 
                                                type="number"
                                                value={age.value}
                                                onChange={(e) => handleAudienceAgeChange(idx, e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded p-1.5 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setIsEditorOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={saveCustomData} className="px-8">
                        <Save size={16} className="mr-2" /> Salvar Edições
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* Modal de Agendamento */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                <button 
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <LogOut size={20} className="rotate-45" />
                </button>
                <h2 className="text-xl font-bold text-white mb-6">Agendar Novo Post</h2>
                
                <div className="space-y-4">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:text-indigo-500 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer relative overflow-hidden ${postMedia ? 'border-indigo-500/50' : ''}`}
                    >
                        {postMedia ? (
                            <div className="relative w-full h-40">
                                <img src={postMedia} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-bold">Trocar Imagem</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <ImageIcon size={32} className="mb-2" />
                                <span className="text-sm">Arraste a foto/vídeo ou clique para upload</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handlePostMediaUpload}
                        />
                    </div>

                    <textarea 
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                        placeholder="Escreva sua legenda..."
                        value={postCaption}
                        onChange={(e) => setPostCaption(e.target.value)}
                    ></textarea>

                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="date" 
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={postDate}
                            onChange={(e) => setPostDate(e.target.value)}
                        />
                        <input 
                            type="time" 
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={postTime}
                            onChange={(e) => setPostTime(e.target.value)}
                        />
                    </div>

                    <Button 
                        className="w-full py-3" 
                        onClick={handleSchedulePost}
                        disabled={!postDate || !postTime}
                    >
                        Confirmar Agendamento
                    </Button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};
