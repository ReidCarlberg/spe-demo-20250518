# Debug Mode Performance Optimizations

## Current Optimizations

The debug mode includes several optimizations to minimize its impact on application performance:

### Memory Efficiency

1. **Limited History Size**: 
   - API call history is limited to the most recent 50 calls
   - Older calls are automatically removed to prevent memory leaks

2. **Conditional Execution**: 
   - Debugging logic only runs when debug mode is explicitly enabled
   - No performance overhead when debug mode is disabled

3. **Lazy Loading**:
   - Debug panel components are only rendered when visible
   - The panel is removed from the DOM when hidden

4. **Response Cloning**:
   - Responses are cloned before being processed to prevent issues with streaming responses
   - Large binary responses are not fully parsed but identified by MIME type

### Performance Considerations

1. **Throttling API Call Updates**:
   - UI updates for API calls are debounced to prevent rapid re-renders
   - Toast notifications are limited to one at a time and auto-dismissed

2. **Efficient DOM Updates**:
   - React memo and useMemo hooks used to prevent unnecessary re-renders
   - Virtual list approach used for large numbers of API calls

## Recommended Future Optimizations

For handling very large numbers of API calls, consider implementing these optimizations:

### Short-Term Improvements

1. **Paginated API Call Display**:
   ```jsx
   // In RequestList.jsx
   const [page, setPage] = useState(1);
   const pageSize = 20;
   const displayedCalls = calls.slice((page - 1) * pageSize, page * pageSize);
   ```

2. **More Aggressive Filtering**:
   ```jsx
   // Add more filters for specific endpoints or domains
   const domainFilters = ['api.sharepoint.com', 'graph.microsoft.com'];
   ```

3. **Time-windowed Debugging**:
   ```jsx
   // Only capture calls in a specific time window
   const startTime = Date.now();
   if (Date.now() - startTime > debugTimeWindow) {
     // Don't capture this call
   }
   ```

### Long-Term Architectural Changes

1. **Websocket-based Monitoring**:
   - Send API call data to a separate monitoring service
   - View calls in a dedicated debugger UI outside the main app

2. **IndexedDB Storage**:
   ```javascript
   // Store API calls in IndexedDB instead of memory
   const storeApiCall = async (call) => {
     const db = await openDatabase();
     const tx = db.transaction('apiCalls', 'readwrite');
     await tx.objectStore('apiCalls').add(call);
   };
   ```

3. **Worker-based Processing**:
   - Move API call processing to a Web Worker
   - Reduce impact on main thread performance

## Implementation Notes

Example implementation of a more efficient request list component:

```jsx
// Optimized RequestList component
import { memo, useMemo } from 'react';

const RequestList = memo(({ calls, selectedCall, onSelectCall }) => {
  // Use virtualization for large lists
  const renderedItems = useMemo(() => {
    return calls.map(call => (
      <RequestItem
        key={call.id}
        call={call}
        isSelected={selectedCall && selectedCall.id === call.id}
        onSelect={onSelectCall}
      />
    ));
  }, [calls, selectedCall, onSelectCall]);
  
  return <div className="api-debug-request-list">{renderedItems}</div>;
});

// Memoized RequestItem component
const RequestItem = memo(({ call, isSelected, onSelect }) => {
  // Component implementation
});
```

## Measuring Performance

Performance should be monitored regularly to ensure the debug mode doesn't impact the application:

1. **Memory Usage Tracking**:
   ```javascript
   // Log memory usage periodically
   setInterval(() => {
     const memoryInfo = performance.memory;
     console.log(`Used JS Heap: ${memoryInfo.usedJSHeapSize / (1024 * 1024)} MB`);
   }, 10000);
   ```

2. **Render Timing**:
   ```javascript
   // Measure render times
   const startTime = performance.now();
   // Render component
   const endTime = performance.now();
   console.log(`Render time: ${endTime - startTime} ms`);
   ```

3. **User-perceived Performance**:
   - Implement a feedback mechanism for users to report slow performance
   - Track interactions with the debug panel to identify slow operations
