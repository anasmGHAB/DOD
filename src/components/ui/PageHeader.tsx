interface PageHeaderProps {
    title: string;
    description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">{title}</h1>
            <p className="mt-2 text-slate-400">{description}</p>
        </div>
    );
}
