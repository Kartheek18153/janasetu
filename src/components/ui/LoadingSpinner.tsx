export default function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`${sizes[size]} animate-spin rounded-full border-[3px] border-secondary-100`} />
        <div className={`${sizes[size]} animate-spin rounded-full border-[3px] border-transparent border-t-primary-500 absolute inset-0`} />
      </div>
    </div>
  );
}