export default function PageHeader({ title, subtitle }) {
    return (
      <div>
        <h2 className="text-[1.8rem] font-bold text-gray-800 leading-snug">
          {title || 'Page Title'}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    )
  }