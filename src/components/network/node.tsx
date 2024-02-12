import Image from "next/image";
import { type FunctionComponent } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

interface ArtistNodeProps {
  label: string;
  image: {
    url: string;
    width: number;
    height: number;
  } | null;
  count: number;
}

export const ArtistNode: FunctionComponent<NodeProps<ArtistNodeProps>> = ({
  data,
}) => {
  const { label, image, count } = data;
  return (
    <>
      <Handle type="target" position={Position.Top} />
      {/* component */}
      <div className="flex  items-center justify-center bg-gray-900">
        {/* Card */}
        <a
          className="delay-50 group w-60 rounded-lg bg-gray-800 p-5 duration-100 hover:bg-gray-700"
          href=""
        >
          {/* Image Cover */}
          <Image
            src={image?.url ?? "/placeholder.png"}
            className="w-full rounded shadow"
            alt={label}
            width={image?.width ?? 200}
            height={image?.height ?? 200}
          />
          {/* Title */}
          <h3 className="mt-5 font-bold text-gray-200"> {label}</h3>
          {/* Description */}#{" "}
          <p className="mt-2 text-xs font-light text-gray-400">{count}</p>
        </a>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle type="source" position={Position.Left} id="b" />
      <Handle type="source" position={Position.Right} id="c" />
    </>
  );
};
