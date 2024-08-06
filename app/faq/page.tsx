export default function FAQ() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">What is this app about?</h2>
          <p>This app is a Next.js application with Firebase integration.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">How do I sign in?</h2>
          <p>You can sign in using your Google account on the home page!</p>
        </div>
        {/* Add more FAQ items as needed */}
      </div>
    </div>
  )
}