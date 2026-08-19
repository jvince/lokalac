import { Button } from "@/components/Button.tsx";
import { FileInput } from "@/components/FileInput.tsx";
import { Label } from "@/components/Label.tsx";
import { IconPhoto, IconX } from "@/icons.ts";
import { useComputed, useSignal } from "@preact/signals";
import { JSX } from "preact";
import { useCallback } from "preact/hooks";
import { v4 as uuid } from "uuid";

interface ImageListItemProps
  extends Pick<JSX.InputHTMLAttributes<HTMLInputElement>, "accept" | "name"> {
  id: string;
  onRemove?: (id: string) => void;
}

const defaultAccept = "image/jpeg,image/png,image/webp";

function ImageListItem(props: ImageListItemProps) {
  const {
    accept = defaultAccept,
    id,
    name,
    onRemove,
  } = props;

  const src = useSignal<string>();
  const withCapture = useSignal<boolean>(false);
  const capture = useComputed(() => (
    withCapture.value ? "environment" : undefined
  ));

  const onChangeHandler = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
      if (e.currentTarget.files && e.currentTarget.files.length > 0) {
        src.value = URL.createObjectURL(e.currentTarget.files[0]);
      }
    },
    [],
  );

  const onCaptureChangeHandler = useCallback(
    (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
      withCapture.value = e.currentTarget.checked;
    },
    [],
  );

  const onRemoveHandler = useCallback(() => {
    if (typeof onRemove === "function") {
      onRemove(id);
    }
  }, [id, onRemove]);

  return (
    <div class="list-row items-center">
      <div class="flex flex-col list-col-grow gap-3">
        <Label for={id} class="cursor-pointer">
          <div class="flex items-center gap-2">
            <div class="avatar">
              <div class="w-16 rounded">
                {!src.value
                  ? <IconPhoto size={64} color="var(--color-base-content)" />
                  : <img src={src.value} alt="preview" />}
              </div>
            </div>

            <span class="text-lg">Click/Tap to select or capture image</span>
          </div>
        </Label>

        <Label size="lg">
          <input
            class="toggle"
            type="checkbox"
            onChange={onCaptureChangeHandler}
          />
          Capture from camera
        </Label>
      </div>

      <Button
        iconOnly
        shape="square"
        size="lg"
        variant="soft"
        onClick={onRemoveHandler}
      >
        <IconX />
      </Button>

      <FileInput
        key={capture.value ? "capture" : "file"}
        accept={accept}
        capture={capture.value}
        class="absolute w-0 h-0 opacity-0"
        id={id}
        name={name}
        onChange={onChangeHandler}
      />
    </div>
  );
}

export function ImageUpload() {
  const items = useSignal<Map<string, JSX.Element>>(new Map());

  const onRemoveItem = useCallback((id: string) => {
    items.value.delete(id);
    items.value = new Map(items.value);
  }, []);

  const onAddImageClick = useCallback(() => {
    const id = uuid();
    items.value = new Map(items.value);
    items.value.set(
      id,
      <ImageListItem
        key={id}
        id={id}
        name="images[]"
        onRemove={onRemoveItem}
      />,
    );
  }, [onRemoveItem]);

  return (
    <div>
      <Button onClick={onAddImageClick}>
        Add Image
      </Button>

      <div class="list">
        {Array.from(items.value.values()).map((item) => item)}
      </div>
    </div>
  );
}
