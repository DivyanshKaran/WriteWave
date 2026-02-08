import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  ErrorBoundary,
  AlertProvider,
  NetworkStatusIndicator,
} from "@/components/error";
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
import Notifications from "./pages/Notifications";
// import EpubUpload from "./pages/EpubUpload"; // Disabled - epub extractor is local implementation only
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SessionInitializer } from "@/components/auth/SessionInitializer";
import Media from "./pages/Media";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { Analytics } from "./components/Analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
            <SessionInitializer />
            <BrowserRouter>
              <Analytics />
              <PageViewTracker />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <AppHub />
                    </RequireAuth>
                  }
                />
                <Route path="/characters" element={<Characters />} />
                <Route path="/characters/hiragana" element={<Hiragana />} />
                <Route path="/characters/katakana" element={<Katakana />} />
                <Route path="/characters/kanji" element={<Kanji />} />
                <Route
                  path="/characters/kanji/:char"
                  element={<KanjiPractice />}
                />
                <Route
                  path="/characters/:type/:char"
                  element={<CharacterPractice />}
                />
                <Route path="/characters/radicals" element={<Radicals />} />
                {/* <Route path="/epub-upload" element={<EpubUpload />} /> */}
                <Route path="/vocabulary" element={<Vocabulary />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route
                  path="/media"
                  element={
                    <RequireAuth>
                      <Media />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/progress"
                  element={
                    <RequireAuth>
                      <Progress />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <RequireAuth>
                      <Notifications />
                    </RequireAuth>
                  }
                />
                <Route path="/community" element={<Community />} />
                <Route path="/forums" element={<Forums />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/:groupId" element={<GroupDetail />} />
                <Route
                  path="/groups/:groupId/forums/:forumId"
                  element={<GroupForumDetail />}
                />
                <Route
                  path="/groups/:groupId/forums/:forumId/threads/:threadId"
                  element={<GroupForumThreadDetail />}
                />
                <Route path="/grammar" element={<Grammar />} />
                <Route path="/articles" element={<Articles />} />
                <Route
                  path="/articles/create"
                  element={
                    <RequireAuth>
                      <CreateArticle />
                    </RequireAuth>
                  }
                />
                <Route path="/articles/:id" element={<ArticleDetail />} />
                <Route
                  path="/me"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireAuth>
                      <Settings />
                    </RequireAuth>
                  }
                />
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
