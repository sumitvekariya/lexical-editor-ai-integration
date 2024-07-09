import '../index.css';
import dynamic from "next/dynamic";

const DynamicComponentWithNoSSR = dynamic(
  () => import('../App'),
  { ssr: false }
)

export default function Home() {
  return (
    <div>
      <DynamicComponentWithNoSSR />
    </div>
  );
}
