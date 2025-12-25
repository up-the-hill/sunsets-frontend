import { useEffect, useState } from 'react';
import { css } from '@linaria/core';

interface PopupProps {
  id: string;
}

export default function SunsetPopup({ id }: PopupProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchImage() {
      try {
        const res = await fetch(`/api/sunsets/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch image url: ${res.statusText}`);
        }
        const url = await res.text();
        if (active) {
          setImageUrl(url);
        }
      } catch (err) {
        if (active) {
          setError('Failed to load image');
          console.error(err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchImage();
    return () => { active = false; };
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!imageUrl) return <div>No image found</div>;

  return (
    <div className={css`
      padding: 10px;
      max-width: 200px;
    `}>
      <img
        src={imageUrl}
        alt="Sunset"
        className={css`
          width: 100%;
          height: auto;
          border-radius: 4px;
        `}
      />
    </div>
  );
}
