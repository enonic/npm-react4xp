export interface EntrySet {
  sourceExtensions :Array<string>
  sourcePath :string
  targetSubDir? :string
}

export interface SymlinksUnderR4xRoot {
  [orig :string] :boolean
}

export type VerboseLog = (
  item :unknown,
  label? :string,
  stringify? :boolean|number
) => void;
