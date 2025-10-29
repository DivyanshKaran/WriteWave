import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary, AlertProvider, NetworkStatusIndicator } from "@/components/error";
import { StoreProvider } from "@/stores/store-provider";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AppHub from "./pages/AppHub";
import Characters from "./pages/Characters";
import Hiragana from "./pages/Hiragana";
import Katakana from "./pages/Katakana";
import Kanji from "./pages/Kanji";
import CharacterPractice from "./pages/CharacterPractice";
import KanjiPractice from "./pages/KanjiPractice";
import Radicals from "./pages/Radicals";
import Vocabulary from "./pages/Vocabulary";
import Lessons from "./pages/Lessons";
import Progress from "./pages/Progress";
import Community from "./pages/Community";
import Forums from "./pages/Forums";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import GroupForumDetail from "./pages/GroupForumDetail";
import GroupForumThreadDetail from "./pages/GroupForumThreadDetail";
import Grammar from "./pages/Grammar";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import CreateArticle from "./pages/CreateArticle";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
// import EpubUpload from "./pages/EpubUpload"; // Disabled - epub extractor is local implementation only

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AlertProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <NetworkStatusIndicator />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/app" element={<AppHub />} />
                <Route path="/characters" element={<Characters />} />
                <Route path="/characters/hiragana" element={<Hiragana />} />
                <Route path="/characters/katakana" element={<Katakana />} />
                <Route path="/characters/kanji" element={<Kanji />} />
                <Route path="/characters/kanji/:char" element={<KanjiPractice />} />
                <Route path="/characters/:type/:char" element={<CharacterPractice />} />
                <Route path="/characters/radicals" element={<Radicals />} />
                {/* <Route path="/epub-upload" element={<EpubUpload />} /> */}
                <Route path="/vocabulary" element={<Vocabulary />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/community" element={<Community />} />
                <Route path="/forums" element={<Forums />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/:groupId" element={<GroupDetail />} />
                <Route path="/groups/:groupId/forums/:forumId" element={<GroupForumDetail />} />
                <Route path="/groups/:groupId/forums/:forumId/threads/:threadId" element={<GroupForumThreadDetail />} />
                <Route path="/grammar" element={<Grammar />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/articles/create" element={<CreateArticle />} />
                <Route path="/articles/:id" element={<ArticleDetail />} />
                <Route path="/me" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AlertProvider>
      </StoreProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
