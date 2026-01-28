export function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-secondary/30 border border-border rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-4/5 w-full bg-zinc-800/50" />
                    <div className="p-5 space-y-3">
                        <div className="h-3 w-20 bg-zinc-800 rounded" />
                        <div className="h-5 w-3/4 bg-zinc-800 rounded" />
                        <div className="h-3 w-full bg-zinc-800/50 rounded" />
                        <div className="h-3 w-2/3 bg-zinc-800/50 rounded" />
                        <div className="pt-2 flex justify-between">
                            <div className="h-5 w-16 bg-zinc-800 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
