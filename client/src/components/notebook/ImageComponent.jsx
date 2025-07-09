// components/notebook/ImageComponent.jsx
export default function ImageComponent({ src, altText }) {
	return (
		<div className="my-4">
			<img
				src={src}
				alt={altText}
				className="max-w-full rounded border border-[#333]"
			/>
		</div>
	)
}
