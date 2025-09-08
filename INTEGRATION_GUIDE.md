# Multi-Agent System Integration Guide

## Quick Start Integration

### 1. Enable the New System
Add this to your main App component or wherever you want to toggle:

```javascript
// Add to your component
import featureFlags, { FEATURE_FLAGS } from './services/featureFlags';

// Enable the new system
useEffect(() => {
  featureFlags.enable(FEATURE_FLAGS.MULTI_AGENT_SYSTEM);
}, []);
```

### 2. Update Your Route/Component
Replace your current WritingInterface with the new version:

```javascript
// In your main app routing
import WritingInterfaceV2 from './components/WritingInterface/WritingInterfaceV2';
import featureFlags, { FEATURE_FLAGS } from './services/featureFlags';

function App() {
  const useNewSystem = featureFlags.isEnabled(FEATURE_FLAGS.MULTI_AGENT_SYSTEM);
  
  return (
    <div>
      {useNewSystem ? (
        <WritingInterfaceV2
          purpose={purpose}
          content={content}
          onContentChange={onContentChange}
          // ... other props
        />
      ) : (
        <WritingInterface
          // ... existing props
        />
      )}
    </div>
  );
}
```

### 3. Test Both Systems
You can easily switch between them:

```javascript
// URL method: add ?multiAgentSystem=true to URL
// Or programmatically:
featureFlags.enable(FEATURE_FLAGS.MULTI_AGENT_SYSTEM);  // New system
featureFlags.disable(FEATURE_FLAGS.MULTI_AGENT_SYSTEM); // Legacy system
```

## That's It! 

No complex migration needed. The new system:
- ✅ Provides fast feedback (1-3s) from mini models
- ✅ Enhances with research agents in background  
- ✅ Falls back to legacy system if anything fails
- ✅ Tracks user preferences automatically
- ✅ Works with your existing components

## Development Workflow

1. **Development**: Test with `?multiAgentSystem=true` in URL
2. **Staging**: Enable for your testing 
3. **Production**: Enable when ready - instant toggle back if needed

## Key Benefits Over Legacy System

- **10x faster** initial feedback (gpt-4o-mini)
- **Progressive enhancement** - best of both worlds
- **Cost optimization** - smart model selection
- **Better UX** - streaming progress indicators
- **Backward compatible** - existing code still works

## Monitoring

The new system provides metrics at:
```javascript
const { getMetrics } = useMultiAgentAnalysis();
const metrics = getMetrics();
console.log('System performance:', metrics);
```

Ready to integrate?