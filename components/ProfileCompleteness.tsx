"use client"

type ProfileCompletenessProps = {
  profile: {
    full_name: string | null
    job_title: string | null
    company: string | null
    avatar_url: string | null
    bio: string | null
  }
}

export default function ProfileCompleteness({ profile }: ProfileCompletenessProps) {
  // Calculate completion percentage
  const fields = [
    { key: 'full_name', label: 'Full name', value: profile.full_name },
    { key: 'job_title', label: 'Job title', value: profile.job_title },
    { key: 'company', label: 'Company', value: profile.company },
    { key: 'avatar_url', label: 'Profile photo', value: profile.avatar_url },
    { key: 'bio', label: 'Bio', value: profile.bio }
  ]

  const completedFields = fields.filter(field => field.value && field.value.trim().length > 0).length
  const percentage = Math.round((completedFields / fields.length) * 100)

  // Color based on completion
  const getColor = () => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getBarColor = () => {
    if (percentage >= 80) return 'bg-green-600'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const missingFields = fields.filter(field => !field.value || field.value.trim().length === 0)

  return (
    <div className="border rounded-xl p-6 bg-white space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Profile Completeness</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getColor()}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full ${getBarColor()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Status message */}
      {percentage === 100 ? (
        <p className="text-sm text-green-600 font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Your profile is complete!
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Complete your profile to make meaningful connections
          </p>
          {missingFields.length > 0 && (
            <div className="text-xs space-y-1">
              <p className="font-medium text-gray-700">Missing fields:</p>
              <ul className="list-disc list-inside text-gray-500 space-y-0.5">
                {missingFields.map(field => (
                  <li key={field.key}>{field.label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
