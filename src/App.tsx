import './App.css'
import { Outlet, Route, Routes } from 'react-router-dom'
import { Home } from './Home.tsx'
import { About } from './About.tsx'
import { Nav } from './Nav.tsx'
import { useFeatureFlag } from './useFeatureFlag.ts'
import { namespaceFlags } from './feature-management/flags.ts'

export const customRoutes = [
  {
    path: '/react-fm-example-dev',
    label: 'Home',
    element: <Home />,
    index: true,
    featureFlag: { namespace: 'routes', flag: 'home' },
  },
  {
    path: 'about',
    label: 'About',
    element: <About />,
    featureFlag: { namespace: 'routes', flag: 'about' },
  },
]

const Layout = () => (
  <div>
    <Nav />
    <Outlet />
  </div>
)

function App() {
  // Call all hooks at the top level
  const homeFlag = useFeatureFlag(namespaceFlags.routes.home)
  const aboutFlag = useFeatureFlag(namespaceFlags.routes.about)

  const routeFlags = [homeFlag, aboutFlag]

  return (
    <>
      <Routes>
        <Route path="/react-fm-example-dev" element={<Layout />}>
          {customRoutes.map((route, index) => {
            const routeFlag = route.featureFlag ? routeFlags[index] : true
            return routeFlag ? (
              <Route
                key={index}
                path={route.path}
                element={route.element}
                index={route.index}
              />
            ) : null
          })}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </>
  )
}

export default App
