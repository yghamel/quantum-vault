import { PrivacyCover } from './components/privacy-cover';
import { Toaster } from './components/ui/sonner';
import { ScreenProvider } from './providers/screen-provider';

const App = () => {
  return (
    <>
      <Toaster position='top-left' duration={3000} />
      <PrivacyCover />

      <div className='relative mx-auto h-full w-full max-w-xl overflow-hidden overscroll-none bg-background pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]'>
        <ScreenProvider />
      </div>
    </>
  );
};

export default App;
