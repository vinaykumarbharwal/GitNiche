"use client";

export default function RepoCardSkeleton() {
  return (
    <div className="flex min-h-72 flex-col justify-between rounded-md border border-border-color bg-bg-card p-5 shadow-sm animate-pulse">
      <div>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Owner placeholder */}
            <div className="h-3 w-1/4 rounded bg-border-color" />
            {/* Title placeholder */}
            <div className="h-5 w-2/3 rounded bg-border-color" />
          </div>
          {/* Score placeholder */}
          <div className="h-10 w-12 rounded bg-border-color" />
        </div>
        
        {/* Description placeholders */}
        <div className="mb-6 space-y-2">
          <div className="h-4 w-full rounded bg-border-color" />
          <div className="h-4 w-5/6 rounded bg-border-color" />
        </div>
        
        {/* Tag pills placeholders */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="h-6 w-16 rounded-full bg-border-color" />
          <div className="h-6 w-20 rounded-full bg-border-color" />
          <div className="h-6 w-24 rounded-full bg-border-color" />
        </div>
      </div>
      
      <div>
        {/* Stats placeholder */}
        <div className="mb-4 flex items-center justify-between border-t border-border-divider pt-3">
          <div className="flex gap-4">
            <div className="h-4 w-12 rounded bg-border-color" />
            <div className="h-4 w-12 rounded bg-border-color" />
          </div>
          <div className="h-4 w-24 rounded bg-border-color" />
        </div>
        
        {/* Action buttons placeholders */}
        <div className="flex gap-2">
          <div className="h-8 w-16 rounded bg-border-color" />
          <div className="h-8 w-24 rounded bg-border-color" />
          <div className="h-8 w-16 rounded bg-border-color" />
        </div>
      </div>
    </div>
  );
}
