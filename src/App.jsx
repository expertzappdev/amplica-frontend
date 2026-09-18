import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import router from 'routes';
import NavigationScroll from 'layout/NavigationScroll';
import ThemeCustomization from 'themes';

export default function App() {
  return (
    <ThemeCustomization>
      <NavigationScroll>
        <>
          <Toaster
           position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                fontSize: '16px',
              },

              success: {
                duration: 3000,
                style: {
                    background: '#28a745',
                },
              },
              error: {
                duration: 3000,
                style: {
                    background: '#dc3545',
                },
              },
            }}
          />
          <RouterProvider router={router} />
        </>
      </NavigationScroll>
    </ThemeCustomization>
  );
}
