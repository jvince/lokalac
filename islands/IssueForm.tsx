import { Button } from "@/components/Button.tsx";
import { CommunityVectorLayerSSR } from "@/components/CommunityVectorLayerSSR.tsx";
import { Dialog } from "@/components/Dialog/Dialog.tsx";
import { DialogActions } from "@/components/Dialog/DialogActions.tsx";
import { DialogBody } from "@/components/Dialog/DialogBody.tsx";
import { DialogContent } from "@/components/Dialog/DialogContent.tsx";
import { Form } from "@/components/Form.tsx";
import { Input } from "@/components/Input.tsx";
import { Label } from "@/components/Label.tsx";
import { Link } from "@/components/Link.tsx";
import { LeafletMapSSR } from "@/components/LeafletMapSSR.tsx";
import { MarkerSSR } from "@/components/MarkerSSR.ts";
import { Select } from "@/components/Select.tsx";
import { Textarea } from "@/components/Textarea.tsx";
import { useAbortableFetch } from "@/hooks/useAbortableFetch.ts";
import { useTranslation } from "@/hooks/useClientTranslation.ts";
import { withGlobalContext } from "@/islands/withGlobalContext.tsx";
import type { IssueCategory } from "@/models/issue-category.ts";
import {
  IssueSubmission,
  MAX_ISSUE_NOTE_LENGTH,
} from "@/models/issue-submission.ts";
import type { IssueType } from "@/models/issue-type.ts";
import type { IssueStatus } from "@/models/issue.ts";
import type { LocalCommunity } from "@/models/local-community.ts";
import type { WithI18nState } from "@/plugins/i18n/src/types.ts";
import { useComputed, useSignal } from "@preact/signals";
import { useDeepSignal } from "deepsignal";
import { IS_BROWSER } from "fresh/runtime";
import type { LatLngLiteral, LatLngTuple } from "leaflet";
import type { ComponentChildren, TargetedEvent } from "preact";
import { Suspense } from "preact/compat";
import { useCallback } from "preact/hooks";
import { IconMapPinOff, IconMapPinPlus } from "../icons.ts";
import { ImageUpload } from "./ImageUpload.tsx";

const EDITABLE_ISSUE_STATUSES = [
  "open",
  "reported",
  "resolved",
  "rejected",
] as const;

type IssueSubmissionFormValues =
  & Partial<
    Pick<
      IssueSubmission,
      "categoryId" | "typeId" | "communityId" | "location" | "note"
    >
  >
  & { status?: IssueStatus };

interface IssueFormProps extends WithI18nState {
  action?: string;
  cancelHref?: string;
  categories: IssueCategory[];
  children?: ComponentChildren;
  communities: LocalCommunity[];
  deleteHref?: string;
  existingImages?: string[];
  issueTypes: IssueType[];
  formValues?: IssueSubmissionFormValues;
  returnTo?: string;
  showImageUpload?: boolean;
  showStatus?: boolean;
  submitLabel?: string;
  versionstamp?: string;
}

interface IssueFormState {
  issueCategory: string | undefined;
  issueType: string | undefined;
  localCommunity: string | undefined;
  location?: LatLngLiteral | undefined;
  note?: string;
}

export const IssueForm = withGlobalContext((props: IssueFormProps) => {
  const { formValues } = props;
  const { t, fromObject } = useTranslation();
  const isDialogOpen = useSignal(false);

  const formState = useDeepSignal<IssueFormState>({
    issueCategory: formValues?.categoryId,
    issueType: formValues?.typeId,
    localCommunity: formValues?.communityId,
    location: formValues?.location
      ? { lat: formValues.location.lat, lng: formValues.location.lng }
      : undefined,
    note: formValues?.note,
  });

  const locationFormatted = useComputed(() => (
    formState.$location?.value
      ? `${formState.$location.value.lat.toFixed(6)}, ${
        formState.$location.value.lng.toFixed(6)
      }`
      : t("common.no_location_selected")
  ));

  const locationFormValue = useComputed(() => (
    JSON.stringify(formState.$location) || ""
  ));

  const shouldFetch = IS_BROWSER && !!formState.localCommunity;

  const onChangeHandler = useCallback(
    (field: keyof IssueFormState) =>
    (event: TargetedEvent<HTMLSelectElement>) => {
      const value = event.currentTarget.value;

      if (field in formState) {
        // deno-lint-ignore no-explicit-any
        (formState as any)[field] = value;
      }

      if (field === "localCommunity") {
        formState.location = undefined;
      }

      if (field === "issueCategory") {
        formState.issueType = undefined;
      }
    },
    [],
  );

  const [data] = useAbortableFetch<LatLngTuple[]>(
    `/api/polygon/${formState.localCommunity}`,
    {
      enabled: shouldFetch,
      defaultValue: [],
    },
  );

  return (
    <Form
      method="POST"
      action={props.action ?? "/issues/submit"}
      lang={props.i18nState.language.code}
      encType={props.showImageUpload === false
        ? "application/x-www-form-urlencoded"
        : "multipart/form-data"}
    >
      <fieldset class="fieldset gap-y-4">
        <Select
          value={formState.localCommunity ?? ""}
          fullWidth
          label={t("common.local_community")}
          name="local_community"
          required
          size="lg"
          onChange={onChangeHandler("localCommunity")}
        >
          <option disabled selected={!formState.localCommunity} value="">
            {t("common.select_local_community")}
          </option>
          {props.communities.map((community) => (
            <option
              value={community.id}
              key={community.id}
              selected={formState.localCommunity === community.id}
            >
              {fromObject(community, "name")}
            </option>
          ))}
        </Select>

        <Select
          value={formState.issueCategory ?? ""}
          fullWidth
          label={t("common.issue_category")}
          name="issue_category"
          required
          size="lg"
          onChange={onChangeHandler("issueCategory")}
        >
          <option disabled selected={!formState.issueCategory} value="">
            {t("common.select_issue_category")}
          </option>
          {props.categories.map((category) => (
            <option
              value={category.id}
              key={category.id}
              selected={formState.issueCategory === category.id}
            >
              {fromObject(category, "name")}
            </option>
          ))}
        </Select>

        <Select
          value={formState.issueType ?? ""}
          fullWidth
          label={t("common.issue_type")}
          name="issue_type"
          required
          size="lg"
          onChange={onChangeHandler("issueType")}
        >
          <option disabled selected={!formState.issueType} value="">
            {t("common.select_issue_type")}
          </option>
          {props.issueTypes
            .filter((issueType) =>
              issueType.category === formState.issueCategory
            )
            .map((issue) => (
              <option
                value={issue.id}
                key={issue.id}
                selected={formState.issueType === issue.id}
              >
                {fromObject(issue, "name")}
              </option>
            ))}
        </Select>

        <Input
          aria-label="Location"
          contentAfter={
            <Button
              aria-label={t("common.clear_location")}
              color="warning"
              disabled={!formState.location}
              size="lg"
              title={t("common.clear_location")}
              onClick={() => {
                formState.location = undefined;
              }}
            >
              <span aria-hidden="true">
                <IconMapPinOff />
              </span>
            </Button>
          }
          contentBefore={
            <Button
              aria-label={t("common.select_location")}
              color="secondary"
              disabled={!formState.localCommunity}
              size="lg"
              title={t("common.select_location")}
              onClick={() => {
                isDialogOpen.value = true;
              }}
            >
              <span aria-hidden="true">
                <IconMapPinPlus />
              </span>
            </Button>
          }
          disabled
          fullWidth
          label={t("common.location")}
          size="lg"
          value={locationFormatted.value}
        />
        <Dialog
          open={isDialogOpen}
          size="lg"
          onOpenChange={(e) => isDialogOpen.value = e.detail.open}
        >
          <DialogBody>
            <DialogContent>
              <Suspense fallback={null}>
                {IS_BROWSER && (
                  <LeafletMapSSR style={{ height: "100%" }}>
                    <Suspense fallback={null}>
                      <CommunityVectorLayerSSR
                        positions={data as LatLngTuple[]}
                        onClick={(_, data) => {
                          formState.location = data;
                        }}
                      />
                      <Suspense fallback={null}>
                        {formState.location && (
                          <MarkerSSR position={formState.location} />
                        )}
                      </Suspense>
                    </Suspense>
                  </LeafletMapSSR>
                )}
              </Suspense>
            </DialogContent>

            <DialogActions>
              <Button
                autoFocus
                color="primary"
                size="lg"
                onClick={() => {
                  isDialogOpen.value = false;
                }}
              >
                {t("common.close")}
              </Button>
            </DialogActions>
          </DialogBody>
        </Dialog>

        <Label for="note" size="lg">
          {t("common.note")}
        </Label>

        <Textarea
          defaultValue={formState.note}
          id="note"
          maxLength={MAX_ISSUE_NOTE_LENGTH}
          name="note"
        />

        {props.showStatus && (
          <Select
            defaultValue={formValues?.status}
            fullWidth
            label={t("common.status")}
            name="status"
            required
            size="lg"
          >
            {EDITABLE_ISSUE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`common.status_${status}`)}
              </option>
            ))}
          </Select>
        )}

        {!!props.existingImages?.length && (
          <div>
            <Label size="lg">{t("common.images")}</Label>
            <div class="flex flex-wrap gap-2">
              {props.existingImages.map((image) => (
                <img class="max-h-40" key={image} src={image} />
              ))}
            </div>
          </div>
        )}

        {props.showImageUpload !== false && <ImageUpload />}

        <Button
          color="primary"
          fullWidth
          size="lg"
          type="submit"
        >
          {props.submitLabel ?? t("common.submit")}
        </Button>

        {(props.cancelHref || props.deleteHref) && (
          <div class="flex justify-between gap-2">
            {props.cancelHref && (
              <Link
                as="btn"
                href={props.cancelHref}
                lang={props.i18nState.language.code}
              >
                {t("common.back")}
              </Link>
            )}
            {props.deleteHref && (
              <Link
                as="btn"
                color="warning"
                href={props.deleteHref}
                lang={props.i18nState.language.code}
              >
                {t("common.delete")}
              </Link>
            )}
          </div>
        )}

        <input
          type="hidden"
          name="location"
          value={locationFormValue}
        />
        {props.versionstamp && (
          <input type="hidden" name="versionstamp" value={props.versionstamp} />
        )}
        {props.returnTo && (
          <input type="hidden" name="return_to" value={props.returnTo} />
        )}
      </fieldset>
    </Form>
  );
});
