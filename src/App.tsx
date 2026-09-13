import { PrivacyCover } from './components/privacy-cover';
import { Toaster } from './components/ui/sonner';
import { ScreenProvider } from './providers/screen-provider';

const App = () => {
  return (
    <>
      <Toaster position='top-left' duration={3000} />
      <PrivacyCover />

      <div className='relative h-dvh w-full max-w-full overflow-x-hidden overflow-y-auto bg-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'>
        <ScreenProvider />
      </div>
    </>
  );
};

export default App;
