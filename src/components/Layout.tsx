interface LayoutProps extends React.PropsWithChildren {}

interface LayoutProps extends React.PropsWithChildren {}

export default function Layout(props: LayoutProps) {
  return (
    <div className="flex min-h-full w-full flex-col p-6 pt-8 md:p-14 md:py-12">
      <div className="w-full max-w-[800px]">
        <div className="mb-8 sm:mb-10">
          <div className="text-2xl font-semibold sm:text-3xl">PoW protection</div>
        </div>
        {props.children}
      </div>
    </div>
  );
}
