import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import Rox from 'rox-browser'

import { namespaceFlags } from './flags'

interface IInitFM {
  apiKey: string
}

const FeatureFlagContext = createContext(namespaceFlags)

export const useFeatureFlagContext = () => useContext(FeatureFlagContext)

/**
 * This component is responsible for initiating a connection
 * to Feature Management, and providing a simplified mechanism for accessing
 * feature flags to its child components. When accessing flags via
 * the useFeatureFlagContext hook, you won't be dealing with the
 * raw rox objects (if you access flags from namespaceFlags, this is
 * what you'd be dealing with). Instead, this component and
 * the corresponding useFeatureFlagContext hook exposes the name of the FF
 * which will automatically resolve its isEnabled() value.
 *
 * This component should wrap other components, which won't render
 * until FM finishes initializing.
 *
 * The user and organization props are required so that the custom
 * rox properties work correctly.
 */
export const FeatureFlagProvider = ({ children }: PropsWithChildren) => {
  const sdkKey = '17c1651d-5d42-4fa2-b21e-833e94dd84fc'
  const [isFMReady, setIsFMReady] = useState(!sdkKey)

  if (!sdkKey) {
    console.warn('No FM API key found. Feature flags will not be available.')
  }
  const initFM = useCallback(async ({ apiKey }: IInitFM) => {
    // HACK: use a document global to ensure this doesn't run more than once.
    // This is necessary to avoid <StrictMode> causing problems since to forces
    // everything to run twice when running locally

    const globalContext = document as unknown as { fmHasLoaded: boolean }
    if (globalContext.fmHasLoaded) {
      return
    }
    globalContext.fmHasLoaded = true

    const options = {}

    // Register the flags
    Object.keys(namespaceFlags || []).forEach((namespace) => {
      const flagsUnderNamespace = (namespaceFlags as any)[namespace]
      Rox.register(namespace, flagsUnderNamespace)
    })

    // Setup the key (this can only be called once)
    await Rox.setup(apiKey, options)

    setIsFMReady(true)
  }, [])

  useEffect(() => {
    initFM({ apiKey: sdkKey })
  }, [sdkKey, initFM])

  return isFMReady ? (
    <FeatureFlagContext.Provider value={namespaceFlags}>
      {children}
    </FeatureFlagContext.Provider>
  ) : (
    <div>Loading...</div>
  )
}
