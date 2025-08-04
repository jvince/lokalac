import { Button } from "$components/Button.tsx";
import { CommunityVectorLayerSSR } from "$components/CommunityVectorLayerSSR.tsx";
import { Dialog } from "$components/Dialog/Dialog.tsx";
import { DialogActions } from "$components/Dialog/DialogActions.tsx";
import { DialogBody } from "$components/Dialog/DialogBody.tsx";
import { DialogContent } from "$components/Dialog/DialogContent.tsx";
import { Form } from "$components/Form.tsx";
import { Input } from "$components/Input.tsx";
import { Label } from "$components/Label.tsx";
import { LeafletMapSSR } from "$components/LeafletMapSSR.tsx";
import { MarkerSSR } from "$components/MarkerSSR.ts";
import { Select } from "$components/Select.tsx";
import { Textarea } from "$components/Textarea.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useAbortableFetch } from "$hooks/useAbortableFetch.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import type { IssueCategory } from "$models/issue-category.ts";
import type { IssueType } from "$models/issue-type.ts";
import { IssueLocation } from "$models/issue.ts";
import type { LocalCommunity } from "$models/local-community.ts";
import type { WithI18nState } from "$plugins/i18n/src/types.ts";
import { useComputed, useSignal } from "@preact/signals";
import { useDeepSignal } from "deepsignal";
import MapPinOffIcon from "https://deno.land/x/tabler_icons_tsx@0.0.7/tsx/map-pin-off.tsx";
import MapPinPlusIcon from "https://deno.land/x/tabler_icons_tsx@0.0.7/tsx/map-pin-plus.tsx";
import type { LatLngLiteral, LatLngTuple } from "leaflet";
import type { ComponentChildren, JSX } from "preact";
import { useCallback } from "preact/hooks";
import { Suspense } from "react-dom";

export interface IssueFormValues {
  localCommunity?: string;
  issueCategory?: string;
  issueType?: string;
  location?: IssueLocation;
  note?: string;
}

interface IssueFormProps extends WithI18nState {
  categories: IssueCategory[];
  children?: ComponentChildren;
  communities: LocalCommunity[];
  issueTypes: IssueType[];
  formValues?: IssueFormValues;
}

interface IssueFormState {
  issueCategory: string | undefined;
  issueType: string | undefined;
  localCommunity: string | undefined;
  location?: LatLngLiteral | undefined;
  note?: string;
}

export function IssueForm(props: IssueFormProps) {
  const { formValues } = props;
  const { t, fromObject } = useTranslation(props.i18nState);
  const isDialogOpen = useSignal(false);

  const formState = useDeepSignal<IssueFormState>({
    issueCategory: formValues?.issueCategory,
    issueType: formValues?.issueType,
    localCommunity: formValues?.localCommunity,
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
    (e: JSX.TargetedEvent<HTMLSelectElement>) => {
      const value = e.currentTarget.value;

      if (field in formState) {
        // deno-lint-ignore no-explicit-any
        (formState as any)[field] = value;
      }

      if (field === "localCommunity") {
        formState.location = undefined; // Reset location when community changes
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
      action="/issues/submit"
      lang={props.i18nState.language.code}
      f-client-nav={false}
    >
      <fieldset class="fieldset gap-y-4">
        <legend class="fieldset-legend">
          Create an Issue
        </legend>

        <Select
          defaultValue={formState.localCommunity}
          fullWidth
          label={t("common.local_community")}
          name="local_community"
          required
          size="lg"
          onChange={onChangeHandler("localCommunity")}
        >
          <option disabled selected value="">
            {t("common.select_local_community")}
          </option>
          {props.communities.map((community) => (
            <option value={community.id} key={community.id}>
              {fromObject(community, "name")}
            </option>
          ))}
        </Select>

        <Select
          defaultValue={formState.issueCategory}
          fullWidth
          label={t("common.issue_category")}
          name="issue_category"
          required
          size="lg"
          onChange={onChangeHandler("issueCategory")}
        >
          <option disabled selected value="">
            {t("common.select_issue_category")}
          </option>
          {props.categories.map((category) => (
            <option value={category.id} key={category.id}>
              {fromObject(category, "name")}
            </option>
          ))}
        </Select>

        <Select
          defaultValue={formState.issueType}
          fullWidth
          label={t("common.issue_type")}
          name="issue_type"
          required
          size="lg"
          onChange={onChangeHandler("issueType")}
        >
          <option disabled selected value="">
            {t("common.select_issue_type")}
          </option>
          {props.issueTypes
            .filter((issueType) =>
              issueType.category === formState.issueCategory
            )
            .map((issue) => (
              <option value={issue.id} key={issue.id}>
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
                <MapPinOffIcon />
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
                <MapPinPlusIcon />
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

        <Label as="label" for="note" size="lg">
          {t("common.note")}
        </Label>

        <Textarea
          defaultValue={formState.note}
          id="note"
          name="note"
        />

        <Button
          color="primary"
          fullWidth
          size="lg"
          type="submit"
        >
          {t("common.submit")}
        </Button>

        <input
          type="hidden"
          name="location"
          value={locationFormValue}
        />
      </fieldset>
    </Form>
  );
}
