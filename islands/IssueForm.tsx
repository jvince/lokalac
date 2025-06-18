import { Button } from "$components/Button.tsx";
import { Form } from "$components/Form.tsx";
import { Select } from "$components/Select.tsx";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useTranslation } from "$hooks/useTranslation.ts";
import { IssueCategory } from "$models/issue-category.ts";
import { IssueType } from "$models/issue-type.ts";
import type { LocalCommunity } from "$models/local-community.ts";
import { i18nState } from "$plugins/i18n/mod.ts";
import { computed, useSignal } from "@preact/signals";
import type { ComponentChildren, JSX } from "preact";
import { lazy, Suspense } from "preact/compat";
import { useCallback } from "preact/hooks";

const LazyMap = lazy(() =>
  import("$components/LeafletMap.tsx").then((mod) => mod.LeafletMap)
);

interface IssueFormProps {
  i18nState: i18nState;
  categories: IssueCategory[];
  children?: ComponentChildren;
  communities: LocalCommunity[];
  issueTypes: IssueType[];
}

interface IssueFormState {
  localCommunity: string | null;
  issueCategory: string | null;
  issueType: string | null;
}

export function IssueForm(props: IssueFormProps) {
  const { t, fromObject } = useTranslation(props.i18nState);

  const state = useSignal<IssueFormState>({
    localCommunity: null,
    issueCategory: null,
    issueType: null,
  });

  const canSubmit = computed(() => (
    Object.values(state.value).every(Boolean)
  ));

  const onChangeHandler = useCallback(
    (field: keyof IssueFormState) =>
    (e: JSX.TargetedEvent<HTMLSelectElement>) => {
      const value = e.currentTarget.value;
      state.value = {
        ...state.value,
        [field]: value === "" ? null : value,
      };
    },
    [],
  );

  return (
    <Form method="POST" action="/submit-issue" f-client-nav={false}>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">
          Create an Issue
        </legend>

        <Select
          name="local_community"
          required
          onChange={onChangeHandler("localCommunity")}
        >
          <option disabled selected value="">
            {t("common.local_community")}
          </option>
          {props.communities.map((community) => (
            <option value={community.id} key={community.id}>
              {fromObject(community, "name")}
            </option>
          ))}
        </Select>

        <Select
          name="issue_category"
          required
          onChange={onChangeHandler("issueCategory")}
        >
          <option disabled selected value="">
            Select a category
          </option>
          {props.categories.map((category) => (
            <option value={category.id} key={category.id}>
              {fromObject(category, "name")}
            </option>
          ))}
        </Select>

        <Select
          name="issue_type"
          required
          disabled={!state.value.issueCategory}
          onChange={onChangeHandler("issueType")}
        >
          <option disabled selected value="">
            Select a issue
          </option>
          {props.issueTypes
            .filter((issueType) =>
              issueType.category === state.value.issueCategory
            )
            .map((issue) => (
              <option value={issue.id} key={issue.id}>
                {fromObject(issue, "name")}
              </option>
            ))}
        </Select>

        <textarea class="textarea" placeholder="note" name="note" />

        <Button disabled={!canSubmit.value} type="submit">
          {t("common.submit")}
        </Button>
      </fieldset>

      <Suspense fallback="Loading map...">
        {IS_BROWSER && <LazyMap />}
      </Suspense>
    </Form>
  );
}
