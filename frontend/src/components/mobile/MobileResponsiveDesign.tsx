"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Tablet, Monitor, Menu, X, Search, Bell, User, Home, BookOpen, Target, Users, Settings, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Plus, Minus, RotateCcw, RefreshCw, Maximize, Minimize, Move, GripVertical, MoreVertical, Filter, Sort, Grid, List, Eye, EyeOff, Sun, Moon, Palette, Layout, Columns, Rows, Sidebar, PanelTop, PanelBottom, PanelLeft, PanelRight, Center, AlignLeft, AlignRight, AlignCenter, Justify, Text, Image, Video, Music, File, Folder, Download, Upload, Share, Copy, Paste, Cut, Trash, Archive, Star, Heart, Bookmark, Flag, Tag, Label, Pin, MapPin, Clock, Calendar, Timer, Stopwatch, Zap, Battery, Wifi, Bluetooth, Signal, Volume2, VolumeX, Mic, MicOff, Camera, Video as VideoIcon, Phone, Mail, MessageCircle, Send, Reply, Forward, Edit, Save, Check, X as XIcon, AlertCircle, Info, HelpCircle, ExternalLink, Link, Unlink, Lock, Unlock, Shield, Key, UserCheck, UserX, UserPlus, Users as UsersIcon, UserMinus, Crown, Medal, Award, Trophy, Gift, Present, Box, Package, ShoppingCart, CreditCard, DollarSign, Coins, Banknote, TrendingUp, TrendingDown, BarChart, PieChart, LineChart, Activity, Pulse, Heart as HeartIcon, Brain, Lightbulb, Zap as ZapIcon, Rocket, Plane, Car, Bike, Walk, Run, Swim, Gamepad2, Controller, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Play, Pause, SkipBack, SkipForward, FastForward, Rewind, Shuffle, Repeat, Repeat1, Volume1, Volume3, Headphones, Speaker, Radio, Tv, Laptop, Computer, Printer, Scanner, Keyboard, Mouse, MousePointer, Touch, Hand, Fingerprint, Scan, QrCode, Barcode, CreditCard as CreditCardIcon, Wallet, Bag, Backpack, Suitcase, Briefcase, FolderOpen, FileText, FileImage, FileVideo, FileAudio, FilePdf, FileWord, FileExcel, FilePowerpoint, FileZip, FileCode, FileJson, FileXml, FileCsv, FileHtml, FileCss, FileJs, FileTs, FilePy, FileJava, FileC, FileCpp, FilePhp, FileRuby, FileGo, FileRust, FileSwift, FileKotlin, FileDart, FileVue, FileReact, FileAngular, FileSvelte, FileNext, FileNuxt, FileGatsby, FileVite, FileWebpack, FileRollup, FileParcel, FileBabel, FileEslint, FilePrettier, FileJest, FileCypress, FilePlaywright, FileSelenium, FileDocker, FileKubernetes, FileAws, FileAzure, FileGcp, FileHeroku, FileVercel, FileNetlify, FileGithub, FileGitlab, FileBitbucket, FileJira, FileSlack, FileDiscord, FileTelegram, FileWhatsapp, FileInstagram, FileFacebook, FileTwitter, FileLinkedin, FileYoutube, FileTiktok, FileSnapchat, FilePinterest, FileReddit, FileTwitch, FileSpotify, FileApple, FileGoogle, FileMicrosoft, FileAmazon, FileNetflix, FileUber, FileAirbnb, FileStripe, FilePaypal, FileSquare, FileShopify, FileWooCommerce, FileMagento, FileBigcommerce, FileSquarespace, FileWix, FileWordpress, FileDrupal, FileJoomla, FileGhost, FileStrapi, FileSanity, FileContentful, FilePrismic, FileStoryblok, FileButtercms, FileDirectus, FileSupabase, FileFirebase, FileMongodb, FilePostgresql, FileMysql, FileSqlite, FileRedis, FileElasticsearch, FileKibana, FileGrafana, FilePrometheus, FileInfluxdb, FileTimescaledb, FileCockroachdb, FilePlanetscale, FileNeon, FileRailway, FileRender, FileFly, FileDigitalocean, FileLinode, FileVultr, FileHetzner, FileScaleway, FileOvh, FileIonos, FileHostgator, FileBluehost, FileSiteground, FileNamecheap, FileGodaddy, FileCloudflare, FileAkamai, FileFastly, FileKeycdn, FileMaxcdn, FileCdn77, FileBunnycdn, FileStackpath, FileLimelight, FileEdgio, FileSection, FileAzion, FileGcore, FileBelugacdn, FileCachefly, FileCedexis, FileDyn, FileDnsmadeeasy, FileCloudns, FileName, FileFreedns, FileNoip, FileDuckdns, FileAfraid, FileDynu, FileChangeip, FileZonomi, FileEasy, FilePorkbun, FileNamesilo, FileInternetbs, FileGandi, FileRegistrar, FileDomain, FileTld, FileSld, FileSubdomain, FileWildcard, FileApex, FileCname, FileMx, FileTxt, FileSrv, FileAaaa, FilePtr, FileNs, FileSoa, FileDnskey, FileDs, FileCds, FileCdnskey, FileTlsa, FileSmimea, FileHttps, FileHttp, FileFtp, FileSftp, FileSsh, FileTelnet, FileRdp, FileVnc, FileTeamviewer, FileAnydesk, FileChrome, FileFirefox, FileSafari, FileEdge, FileOpera, FileBrave, FileVivaldi, FileTor, FileDuckduckgo, FileBing, FileYahoo, FileBaidu, FileYandex, FileEcosia, FileStartpage, FileSearx, FileQwant, FileSwisscows, FileMojeek, FileGigablast, FileExalead, FileIxquick, FileMetager, FileUnbubble, FileGibiru, FileYippy, FileDogpile, FileWebcrawler, FileInfospace, FileMamma, FileHotbot, FileLycos, FileAltavista, FileExcite, FileInfoseek, FileLooksmart, FileOverture, FileAlltheweb, FileTeoma, FileWisenut, FileGigablast as GigablastIcon, FileVivisimo, FileKartoo, FileMooter, FileClusty, FileZuula, FileSputnik, FileRambler, FileMailru, FileOdnoklassniki, FileVkontakte, FileLivejournal, FileHabr, FileGeektimes, FileTjournal, FileVc, FileRbc, FileLenta, FileGazeta, FileKommersant, FileVedomosti, FileIzvestia, FileKomsomolskaya, FileMoskovsky, FileArgumenty, FileNovaya, FileSvoboda, FileEcho, FileDozhd, FileNtv, FileRtr, FilePervy, FileRossiya, FileSts, FileTnt, FileRen, FileDomashny, FileZvezda, FileMir, FileTvc, FileRbk, FileForbes, FileVedomosti as VedomostiIcon, FileKommersant as KommersantIcon, FileGazeta as GazetaIcon, FileLenta as LentaIcon, FileRbc as RbcIcon, FileVc as VcIcon, FileTjournal as TjournalIcon, FileHabr as HabrIcon, FileGeektimes as GeektimesIcon, FileLivejournal as LivejournalIcon, FileVkontakte as VkontakteIcon, FileOdnoklassniki as OdnoklassnikiIcon, FileMailru as MailruIcon, FileRambler as RamblerIcon, FileSputnik as SputnikIcon, FileZuula as ZuulaIcon, FileClusty as ClustyIcon, FileMooter as MooterIcon, FileKartoo as KartooIcon, FileVivisimo as VivisimoIcon, FileWisenut as WisenutIcon, FileTeoma as TeomaIcon, FileAlltheweb as AllthewebIcon, FileOverture as OvertureIcon, FileLooksmart as LooksmartIcon, FileInfoseek as InfoseekIcon, FileExcite as ExciteIcon, FileAltavista as AltavistaIcon, FileLycos as LycosIcon, FileHotbot as HotbotIcon, FileMamma as MammaIcon, FileInfospace as InfospaceIcon, FileWebcrawler as WebcrawlerIcon, FileDogpile as DogpileIcon, FileYippy as YippyIcon, FileUnbubble as UnbubbleIcon, FileMetager as MetagerIcon, FileIxquick as IxquickIcon, FileExalead as ExaleadIcon, FileGigablast as GigablastIcon2, FileMojeek as MojeekIcon, FileSwisscows as SwisscowsIcon, FileQwant as QwantIcon, FileSearx as SearxIcon, FileStartpage as StartpageIcon, FileEcosia as EcosiaIcon, FileYandex as YandexIcon, FileBaidu as BaiduIcon, FileYahoo as YahooIcon, FileBing as BingIcon, FileDuckduckgo as DuckduckgoIcon, FileTor as TorIcon, FileVivaldi as VivaldiIcon, FileBrave as BraveIcon, FileOpera as OperaIcon, FileEdge as EdgeIcon, FileSafari as SafariIcon, FileFirefox as FirefoxIcon, FileChrome as ChromeIcon, FileAnydesk as AnydeskIcon, FileTeamviewer as TeamviewerIcon, FileVnc as VncIcon, FileRdp as RdpIcon, FileTelnet as TelnetIcon, FileSsh as SshIcon, FileSftp as SftpIcon, FileFtp as FtpIcon, FileHttp as HttpIcon, FileHttps as HttpsIcon, FileSmimea as SmimeaIcon, FileTlsa as TlsaIcon, FileCdnskey as CdnskeyIcon, FileCds as CdsIcon, FileDs as DsIcon, FileDnskey as DnskeyIcon, FileSoa as SoaIcon, FileNs as NsIcon, FilePtr as PtrIcon, FileAaaa as AaaaIcon, FileSrv as SrvIcon, FileTxt as TxtIcon, FileMx as MxIcon, FileCname as CnameIcon, FileApex as ApexIcon, FileWildcard as WildcardIcon, FileSubdomain as SubdomainIcon, FileSld as SldIcon, FileTld as TldIcon, FileDomain as DomainIcon, FileRegistrar as RegistrarIcon, FileGandi as GandiIcon, FileInternetbs as InternetbsIcon, FileNamesilo as NamesiloIcon, FilePorkbun as PorkbunIcon, FileEasy as EasyIcon, FileZonomi as ZonomiIcon, FileChangeip as ChangeipIcon, FileDynu as DynuIcon, FileAfraid as AfraidIcon, FileDuckdns as DuckdnsIcon, FileNoip as NoipIcon, FileFreedns as FreednsIcon, FileName as NameIcon, FileCloudns as CloudnsIcon, FileDnsmadeeasy as DnsmadeeasyIcon, FileDyn as DynIcon, FileCedexis as CedexisIcon, FileCachefly as CacheflyIcon, FileBelugacdn as BelugacdnIcon, FileGcore as GcoreIcon, FileAzion as AzionIcon, FileSection as SectionIcon, FileEdgio as EdgioIcon, FileStackpath as StackpathIcon, FileBunnycdn as BunnycdnIcon, FileCdn77 as Cdn77Icon, FileMaxcdn as MaxcdnIcon, FileKeycdn as KeycdnIcon, FileFastly as FastlyIcon, FileAkamai as AkamaiIcon, FileCloudflare as CloudflareIcon, FileGodaddy as GodaddyIcon, FileNamecheap as NamecheapIcon, FileSiteground as SitegroundIcon, FileBluehost as BluehostIcon, FileHostgator as HostgatorIcon, FileIonos as IonosIcon, FileOvh as OvhIcon, FileScaleway as ScalewayIcon, FileHetzner as HetznerIcon, FileVultr as VultrIcon, FileLinode as LinodeIcon, FileDigitalocean as DigitaloceanIcon, FileFly as FlyIcon, FileRender as RenderIcon, FileRailway as RailwayIcon, FileNeon as NeonIcon, FilePlanetscale as PlanetscaleIcon, FileCockroachdb as CockroachdbIcon, FileTimescaledb as TimescaledbIcon, FileInfluxdb as InfluxdbIcon, FilePrometheus as PrometheusIcon, FileGrafana as GrafanaIcon, FileKibana as KibanaIcon, FileElasticsearch as ElasticsearchIcon, FileRedis as RedisIcon, FileSqlite as SqliteIcon, FileMysql as MysqlIcon, FilePostgresql as PostgresqlIcon, FileMongodb as MongodbIcon, FileFirebase as FirebaseIcon, FileSupabase as SupabaseIcon, FileDirectus as DirectusIcon, FileButtercms as ButtercmsIcon, FileStoryblok as StoryblokIcon, FilePrismic as PrismicIcon, FileContentful as ContentfulIcon, FileSanity as SanityIcon, FileStrapi as StrapiIcon, FileGhost as GhostIcon, FileJoomla as JoomlaIcon, FileDrupal as DrupalIcon, FileWordpress as WordpressIcon, FileWix as WixIcon, FileSquarespace as SquarespaceIcon, FileBigcommerce as BigcommerceIcon, FileMagento as MagentoIcon, FileWooCommerce as WooCommerceIcon, FileShopify as ShopifyIcon, FileSquare as SquareIcon, FilePaypal as PaypalIcon, FileStripe as StripeIcon, FileAirbnb as AirbnbIcon, FileUber as UberIcon, FileNetflix as NetflixIcon, FileAmazon as AmazonIcon, FileMicrosoft as MicrosoftIcon, FileGoogle as GoogleIcon, FileApple as AppleIcon, FileSpotify as SpotifyIcon, FileTwitch as TwitchIcon, FileReddit as RedditIcon, FilePinterest as PinterestIcon, FileSnapchat as SnapchatIcon, FileTiktok as TiktokIcon, FileYoutube as YoutubeIcon, FileLinkedin as LinkedinIcon, FileTwitter as TwitterIcon, FileFacebook as FacebookIcon, FileInstagram as InstagramIcon, FileWhatsapp as WhatsappIcon, FileTelegram as TelegramIcon, FileDiscord as DiscordIcon, FileSlack as SlackIcon, FileJira as JiraIcon, FileBitbucket as BitbucketIcon, FileGitlab as GitlabIcon, FileGithub as GithubIcon, FileNetlify as NetlifyIcon, FileVercel as VercelIcon, FileHeroku as HerokuIcon, FileGcp as GcpIcon, FileAzure as AzureIcon, FileAws as AwsIcon, FileKubernetes as KubernetesIcon, FileDocker as DockerIcon, FileSelenium as SeleniumIcon, FilePlaywright as PlaywrightIcon, FileCypress as CypressIcon, FileJest as JestIcon, FilePrettier as PrettierIcon, FileEslint as EslintIcon, FileBabel as BabelIcon, FileParcel as ParcelIcon, FileRollup as RollupIcon, FileWebpack as WebpackIcon, FileVite as ViteIcon, FileGatsby as GatsbyIcon, FileNuxt as NuxtIcon, FileNext as NextIcon, FileSvelte as SvelteIcon, FileAngular as AngularIcon, FileReact as ReactIcon, FileVue as VueIcon, FileDart as DartIcon, FileKotlin as KotlinIcon, FileSwift as SwiftIcon, FileRust as RustIcon, FileGo as GoIcon, FileRuby as RubyIcon, FilePhp as PhpIcon, FileCpp as CppIcon, FileC as CIcon, FileJava as JavaIcon, FilePy as PyIcon, FileTs as TsIcon, FileJs as JsIcon, FileCss as CssIcon, FileHtml as HtmlIcon, FileCsv as CsvIcon, FileXml as XmlIcon, FileJson as JsonIcon, FileCode as CodeIcon, FileZip as ZipIcon, FilePowerpoint as PowerpointIcon, FileExcel as ExcelIcon, FileWord as WordIcon, FilePdf as PdfIcon, FileAudio as AudioIcon, FileVideo as VideoIcon, FileImage as ImageIcon, FileText as TextIcon, FolderOpen as FolderOpenIcon, Briefcase as BriefcaseIcon, Suitcase as SuitcaseIcon, Backpack as BackpackIcon, Bag as BagIcon, Wallet as WalletIcon, CreditCard as CreditCardIcon, Barcode as BarcodeIcon, QrCode as QrCodeIcon, Scan as ScanIcon, Fingerprint as FingerprintIcon, Touch as TouchIcon, MousePointer as MousePointerIcon, Mouse as MouseIcon, Keyboard as KeyboardIcon, Scanner as ScannerIcon, Printer as PrinterIcon, Computer as ComputerIcon, Laptop as LaptopIcon, Tv as TvIcon, Radio as RadioIcon, Speaker as SpeakerIcon, Headphones as HeadphonesIcon, Volume3 as Volume3Icon, Volume1 as Volume1Icon, Repeat1 as Repeat1Icon, Repeat as RepeatIcon, Shuffle as ShuffleIcon, Rewind as RewindIcon, FastForward as FastForwardIcon, SkipForward as SkipForwardIcon, SkipBack as SkipBackIcon, Pause as PauseIcon, Play as PlayIcon, Dice6 as Dice6Icon, Dice5 as Dice5Icon, Dice4 as Dice4Icon, Dice3 as Dice3Icon, Dice2 as Dice2Icon, Dice1 as Dice1Icon, Controller as ControllerIcon, Gamepad2 as Gamepad2Icon, Swim as SwimIcon, Run as RunIcon, Walk as WalkIcon, Bike as BikeIcon, Car as CarIcon, Plane as PlaneIcon, Rocket as RocketIcon, Zap as ZapIcon, Lightbulb as LightbulbIcon, Brain as BrainIcon, Heart as HeartIcon, Pulse as PulseIcon, Activity as ActivityIcon, LineChart as LineChartIcon, PieChart as PieChartIcon, BarChart as BarChartIcon, TrendingDown as TrendingDownIcon, TrendingUp as TrendingUpIcon, Banknote as BanknoteIcon, Coins as CoinsIcon, DollarSign as DollarSignIcon, CreditCard as CreditCardIcon2, ShoppingCart as ShoppingCartIcon, Package as PackageIcon, Box as BoxIcon, Present as PresentIcon, Gift as GiftIcon, Trophy as TrophyIcon, Award as AwardIcon, Medal as MedalIcon, Crown as CrownIcon, UserMinus as UserMinusIcon, Users as UsersIcon2, UserPlus as UserPlusIcon, UserX as UserXIcon, UserCheck as UserCheckIcon, Key as KeyIcon, Shield as ShieldIcon, Unlock as UnlockIcon, Lock as LockIcon, Unlink as UnlinkIcon, Link as LinkIcon, ExternalLink as ExternalLinkIcon, HelpCircle as HelpCircleIcon, Info as InfoIcon, AlertCircle as AlertCircleIcon, X as XIcon2, Check as CheckIcon, Save as SaveIcon, Edit as EditIcon, Forward as ForwardIcon, Reply as ReplyIcon, Send as SendIcon, MessageCircle as MessageCircleIcon, Mail as MailIcon, Phone as PhoneIcon, Video as VideoIcon2, Camera as CameraIcon, MicOff as MicOffIcon, Mic as MicIcon, VolumeX as VolumeXIcon, Volume2 as Volume2Icon, Signal as SignalIcon, Bluetooth as BluetoothIcon, Wifi as WifiIcon, Battery as BatteryIcon, Zap as ZapIcon2, Stopwatch as StopwatchIcon, Timer as TimerIcon, Calendar as CalendarIcon, Clock as ClockIcon, MapPin as MapPinIcon, Pin as PinIcon, Label as LabelIcon, Tag as TagIcon, Flag as FlagIcon, Bookmark as BookmarkIcon, Heart as HeartIcon2, Star as StarIcon, Archive as ArchiveIcon, Trash as TrashIcon, Cut as CutIcon, Paste as PasteIcon, Copy as CopyIcon, Share as ShareIcon, Upload as UploadIcon, Download as DownloadIcon, Folder as FolderIcon, File as FileIcon, Music as MusicIcon, Video as VideoIcon3, Image as ImageIcon2, Text as TextIcon2, Justify as JustifyIcon, AlignCenter as AlignCenterIcon, AlignRight as AlignRightIcon, AlignLeft as AlignLeftIcon, Center as CenterIcon, PanelRight as PanelRightIcon, PanelLeft as PanelLeftIcon, PanelBottom as PanelBottomIcon, PanelTop as PanelTopIcon, Sidebar as SidebarIcon, Rows as RowsIcon, Columns as ColumnsIcon, Layout as LayoutIcon, Palette as PaletteIcon, Moon as MoonIcon, Sun as SunIcon, EyeOff as EyeOffIcon, Eye as EyeIcon, List as ListIcon, Grid as GridIcon, Sort as SortIcon, Filter as FilterIcon, MoreVertical as MoreVerticalIcon, GripVertical as GripVerticalIcon, Move as MoveIcon, Minimize as MinimizeIcon, Maximize as MaximizeIcon, RefreshCw as RefreshCwIcon, RotateCcw as RotateCcwIcon, Minus as MinusIcon, Plus as PlusIcon, ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon, ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon, Settings as SettingsIcon, Users as UsersIcon3, Target as TargetIcon, BookOpen as BookOpenIcon, Home as HomeIcon, User as UserIcon, Bell as BellIcon, Search as SearchIcon, X as XIcon3, Menu as MenuIcon, Monitor as MonitorIcon, Tablet as TabletIcon, Smartphone as SmartphoneIcon } from 'lucide-react';

interface MobileResponsiveDesignProps {
  userId: string;
  className?: string;
}

interface ResponsiveBreakpoint {
  name: string;
  width: number;
  height: number;
  device: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

interface LayoutConfig {
  id: string;
  name: string;
  description: string;
  breakpoints: ResponsiveBreakpoint[];
  components: {
    header: 'fixed' | 'sticky' | 'static' | 'hidden';
    sidebar: 'fixed' | 'sticky' | 'collapsible' | 'hidden';
    navigation: 'bottom' | 'top' | 'side' | 'floating';
    content: 'single' | 'multi-column' | 'grid' | 'masonry';
    footer: 'fixed' | 'sticky' | 'static' | 'hidden';
  };
  spacing: {
    padding: number;
    margin: number;
    gap: number;
  };
  typography: {
    baseSize: number;
    scale: number;
    lineHeight: number;
  };
}

interface ResponsiveTest {
  id: string;
  name: string;
  description: string;
  breakpoint: ResponsiveBreakpoint;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  issues: string[];
  recommendations: string[];
  screenshot?: string;
}

export const MobileResponsiveDesign: React.FC<MobileResponsiveDesignProps> = ({
  userId,
  className = ''
}) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<ResponsiveBreakpoint | null>(null);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig | null>(null);
  const [responsiveTests, setResponsiveTests] = useState<ResponsiveTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'breakpoints' | 'layout' | 'tests' | 'preview'>('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [navigationPosition, setNavigationPosition] = useState<'bottom' | 'top' | 'side' | 'floating'>('bottom');

  // Mock responsive breakpoints
  const breakpoints: ResponsiveBreakpoint[] = [
    { name: 'Mobile Portrait', width: 375, height: 667, device: 'mobile', orientation: 'portrait' },
    { name: 'Mobile Landscape', width: 667, height: 375, device: 'mobile', orientation: 'landscape' },
    { name: 'Tablet Portrait', width: 768, height: 1024, device: 'tablet', orientation: 'portrait' },
    { name: 'Tablet Landscape', width: 1024, height: 768, device: 'tablet', orientation: 'landscape' },
    { name: 'Desktop Small', width: 1280, height: 720, device: 'desktop', orientation: 'landscape' },
    { name: 'Desktop Large', width: 1920, height: 1080, device: 'desktop', orientation: 'landscape' }
  ];

  // Mock layout configurations
  const layoutConfigs: LayoutConfig[] = [
    {
      id: 'mobile-first',
      name: 'Mobile-First Layout',
      description: 'Optimized layout starting from mobile and scaling up',
      breakpoints: breakpoints,
      components: {
        header: 'sticky',
        sidebar: 'collapsible',
        navigation: 'bottom',
        content: 'single',
        footer: 'static'
      },
      spacing: {
        padding: 16,
        margin: 8,
        gap: 12
      },
      typography: {
        baseSize: 14,
        scale: 1.2,
        lineHeight: 1.5
      }
    },
    {
      id: 'desktop-first',
      name: 'Desktop-First Layout',
      description: 'Traditional desktop layout with mobile adaptations',
      breakpoints: breakpoints,
      components: {
        header: 'fixed',
        sidebar: 'fixed',
        navigation: 'side',
        content: 'multi-column',
        footer: 'static'
      },
      spacing: {
        padding: 24,
        margin: 16,
        gap: 16
      },
      typography: {
        baseSize: 16,
        scale: 1.25,
        lineHeight: 1.6
      }
    }
  ];

  // Mock responsive tests
  const mockTests: ResponsiveTest[] = [
    {
      id: 'test-1',
      name: 'Mobile Navigation',
      description: 'Test navigation accessibility on mobile devices',
      breakpoint: breakpoints[0],
      status: 'pass',
      issues: [],
      recommendations: ['Consider adding swipe gestures', 'Optimize touch targets']
    },
    {
      id: 'test-2',
      name: 'Tablet Layout',
      description: 'Test layout adaptation for tablet screens',
      breakpoint: breakpoints[2],
      status: 'warning',
      issues: ['Sidebar overlaps content', 'Text too small'],
      recommendations: ['Adjust sidebar width', 'Increase font size']
    },
    {
      id: 'test-3',
      name: 'Desktop Performance',
      description: 'Test performance on desktop browsers',
      breakpoint: breakpoints[4],
      status: 'pass',
      issues: [],
      recommendations: ['Consider lazy loading', 'Optimize images']
    }
  ];

  useEffect(() => {
    const loadResponsiveData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Detect current breakpoint
      const detectBreakpoint = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (width < 768) {
          return breakpoints.find(bp => bp.device === 'mobile' && bp.orientation === (width > height ? 'landscape' : 'portrait')) || breakpoints[0];
        } else if (width < 1024) {
          return breakpoints.find(bp => bp.device === 'tablet' && bp.orientation === (width > height ? 'landscape' : 'portrait')) || breakpoints[2];
        } else {
          return breakpoints.find(bp => bp.device === 'desktop') || breakpoints[4];
        }
      };

      setCurrentBreakpoint(detectBreakpoint());
      setLayoutConfig(layoutConfigs[0]);
      setResponsiveTests(mockTests);
      setIsLoading(false);
    };

    loadResponsiveData();
    
    // Listen for resize events
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width < 768) {
        setShowSidebar(false);
        setNavigationPosition('bottom');
      } else if (width < 1024) {
        setShowSidebar(true);
        setNavigationPosition('side');
      } else {
        setShowSidebar(true);
        setNavigationPosition('side');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-5 h-5 text-blue-500" />;
      case 'tablet': return <Tablet className="w-5 h-5 text-green-500" />;
      case 'desktop': return <Monitor className="w-5 h-5 text-purple-500" />;
      default: return <Monitor className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50';
      case 'fail': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail': return <XIcon className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading responsive design...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b md:hidden">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-semibold text-gray-900">WriteWave</h3>
            <p className="text-sm text-gray-600">Mobile View</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between p-4 bg-white border-b">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="font-semibold text-gray-900">WriteWave</h3>
            <p className="text-sm text-gray-600">Responsive Design Demo</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
              <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Menu</h3>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 space-y-2">
                  <button className="w-full flex items-center space-x-3 p-3 bg-primary text-white rounded-lg">
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                    <span>Learn</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <Target className="w-5 h-5" />
                    <span>Progress</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5" />
                    <span>Community</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar */}
        {showSidebar && (
          <div className="hidden md:block w-64 bg-white border-r">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Navigation</h3>
            </div>
            
            <div className="p-4 space-y-2">
              <button className="w-full flex items-center space-x-3 p-3 bg-primary text-white rounded-lg">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <BookOpen className="w-5 h-5" />
                <span>Learn</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <Target className="w-5 h-5" />
                <span>Progress</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <Users className="w-5 h-5" />
                <span>Community</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          <div className="p-4 bg-white border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Responsive Design Demo</h2>
                <p className="text-gray-600">Current breakpoint: {currentBreakpoint?.name}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {getDeviceIcon(currentBreakpoint?.device || 'desktop')}
                <span className="text-sm font-medium capitalize">
                  {currentBreakpoint?.device} • {currentBreakpoint?.orientation}
                </span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border-base rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Mobile First</h3>
                    <Smartphone className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Designed for mobile devices first, then scaled up for larger screens
                  </p>
                </div>
                
                <div className="bg-white border-base rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Touch Optimized</h3>
                    <Touch className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Optimized for touch interactions with appropriate target sizes
                  </p>
                </div>
                
                <div className="bg-white border-base rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Adaptive Layout</h3>
                    <Layout className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Layout adapts seamlessly across different screen sizes
                  </p>
                </div>
              </div>

              {/* Responsive Features */}
              <div className="bg-white border-base rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Responsive Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Mobile Optimizations</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Touch-friendly interface</li>
                      <li>• Swipe gestures</li>
                      <li>• Bottom navigation</li>
                      <li>• Collapsible sidebar</li>
                      <li>• Optimized font sizes</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Desktop Features</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Multi-column layout</li>
                      <li>• Fixed sidebar</li>
                      <li>• Hover effects</li>
                      <li>• Keyboard shortcuts</li>
                      <li>• Advanced interactions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Breakpoint Information */}
              {currentBreakpoint && (
                <div className="bg-white border-base rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Current Breakpoint</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {currentBreakpoint.width}px
                      </div>
                      <div className="text-sm text-gray-600">Width</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {currentBreakpoint.height}px
                      </div>
                      <div className="text-sm text-gray-600">Height</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                        {currentBreakpoint.device}
                      </div>
                      <div className="text-sm text-gray-600">Device</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1 capitalize">
                        {currentBreakpoint.orientation}
                      </div>
                      <div className="text-sm text-gray-600">Orientation</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Responsive Tests */}
              <div className="bg-white border-base rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Responsive Tests</h3>
                <div className="space-y-3">
                  {responsiveTests.map((test, index) => (
                    <div key={test.id} className="flex items-center justify-between p-3 border-base rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h4 className="font-medium text-gray-900">{test.name}</h4>
                          <p className="text-sm text-gray-600">{test.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(test.status)}`}>
                          {test.status}
                        </span>
                        {getDeviceIcon(test.breakpoint.device)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex items-center justify-around p-2">
          <button className="flex flex-col items-center space-y-1 p-2 text-primary">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-600">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Learn</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-600">
            <Target className="w-5 h-5" />
            <span className="text-xs">Progress</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span className="text-xs">Community</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2 text-gray-600">
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
