export default function LoadingSpinner() {
  return (
    <div className="loading-spinner-container" role="status" aria-label="Loading">
      <div className="loading-spinner" />
      <p className="loading-text">Loading...</p>
    </div>
  )
}
