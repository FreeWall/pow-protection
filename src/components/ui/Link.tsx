import NextLink, { LinkProps as NextLinkProps } from 'next/link';

interface LinkProps
  extends Pick<NextLinkProps, 'prefetch'>,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: NextLinkProps['href'] | null | undefined;
  disabled?: boolean;
}

export default function Link({
  href,
  children,
  onClick,
  ...props
}: React.PropsWithChildren<LinkProps>) {
  return (
    <NextLink
      href={href ?? '#'}
      prefetch={props.prefetch ?? false}
    >
      <a
        {...props}
        onClick={(e) => {
          (props.disabled || !href) && e.preventDefault();
          onClick?.(e);
        }}
      >
        {children}
      </a>
    </NextLink>
  );
}
