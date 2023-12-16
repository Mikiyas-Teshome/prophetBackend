// To parse this data:
//
//   import { Convert, VipTipsSerializer } from "./file";
//
//   const vipTipsSerializer = Convert.toVipTipsSerializer(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface VipTipsSerializer {
  page: number;
  data: Datum[];
  resultCount: number;
  pageCount: number;
}

export interface Datum {
  type?: string;
  title?: string;
  date?: string;
  index?: number;
  time?: string;
  league?: League;
  teamHome?: League;
  teamAway?: League;
  forecast?: string;
  odds?: string;
  status?: string;
  homeScore?: string;
  awayScore?: string;
  _id?: string;
  coupon?: Coupon;
}

export interface Coupon {
  type: string;
  title: string;
  date: string;
}

export interface League {
  _id: string;
  name: string;
  __v: number;
  countryCode?: string;
  icon: null | string;
  image?: string;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toVipTipsSerializer(json: string): VipTipsSerializer {
    return cast(JSON.parse(json), r('VipTipsSerializer'));
  }

  public static vipTipsSerializerToJson(value: VipTipsSerializer): string {
    return JSON.stringify(uncast(value, r('VipTipsSerializer')), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : '';
  const keyText = key ? ` for key "${key}"` : '';
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
      val,
    )}`,
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(', ')}]`;
    }
  } else if (typeof typ === 'object' && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = '',
  parent: any = '',
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent,
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l('Date'), val, key, parent);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any,
  ): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue(l(ref || 'object'), val, key, parent);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === 'any') return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === 'object' && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty('props')
          ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  VipTipsSerializer: o(
    [
      { json: 'page', js: 'page', typ: 0 },
      { json: 'data', js: 'data', typ: a(r('Datum')) },
      { json: 'resultCount', js: 'resultCount', typ: 0 },
      { json: 'pageCount', js: 'pageCount', typ: 0 },
    ],
    false,
  ),
  Datum: o(
    [
      { json: 'type', js: 'type', typ: u(undefined, '') },
      { json: 'title', js: 'title', typ: u(undefined, '') },
      { json: 'date', js: 'date', typ: u(undefined, '') },
      { json: 'index', js: 'index', typ: u(undefined, 0) },
      { json: 'time', js: 'time', typ: u(undefined, '') },
      { json: 'league', js: 'league', typ: u(undefined, r('League')) },
      { json: 'teamHome', js: 'teamHome', typ: u(undefined, r('League')) },
      { json: 'teamAway', js: 'teamAway', typ: u(undefined, r('League')) },
      { json: 'forecast', js: 'forecast', typ: u(undefined, '') },
      { json: 'odds', js: 'odds', typ: u(undefined, '') },
      { json: 'status', js: 'status', typ: u(undefined, '') },
      { json: 'homeScore', js: 'homeScore', typ: u(undefined, '') },
      { json: 'awayScore', js: 'awayScore', typ: u(undefined, '') },
      { json: '_id', js: '_id', typ: u(undefined, '') },
      { json: 'coupon', js: 'coupon', typ: u(undefined, r('Coupon')) },
    ],
    false,
  ),
  Coupon: o(
    [
      { json: 'type', js: 'type', typ: '' },
      { json: 'title', js: 'title', typ: '' },
      { json: 'date', js: 'date', typ: '' },
    ],
    false,
  ),
  League: o(
    [
      { json: '_id', js: '_id', typ: '' },
      { json: 'name', js: 'name', typ: '' },
      { json: '__v', js: '__v', typ: 0 },
      { json: 'countryCode', js: 'countryCode', typ: u(undefined, '') },
      { json: 'icon', js: 'icon', typ: u(null, '') },
      { json: 'image', js: 'image', typ: u(undefined, '') },
    ],
    false,
  ),
};
