(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  'object' == typeof document ? document.currentScript : void 0,
  98306,
  (e) => {
    'use strict';
    let a;
    var o,
      r,
      t,
      i,
      s,
      n,
      d,
      u = e.i(30722),
      c = e.i(52330);
    let m = {
      Oyekun: [1, 11],
      Iwori: [2, 12],
      Odi: [3, 43],
      Irosun: [4, 14],
      Owonrin: [5, 15, 21, 22],
      Obara: [6, 34],
      Okanran: [7, 8],
      Ogunda: [9, 10],
      Osa: [11, 26],
      Ika: [12, 23],
      Oturupon: [13, 14],
      Otura: [15, 16],
      Irete: [17, 18],
      Ose: [19, 20],
      Eji: [23, 24],
    };
    ((() => {
      let e = new Map();
      for (let [a, o] of Object.entries(m))
        for (let r of o) {
          let o = e.get(r) || [];
          (o.push(a), e.set(r, o));
        }
    })(),
      Object.entries({
        Oyekun: [1, 10],
        Iwori: [2, 3],
        Odi: [4, 5],
        Irosun: [6, 7],
        Owonrin: [8, 9, 10],
        Obara: [10, 6],
        Okanran: [3, 7],
        Ogunda: [4, 5],
        Osa: [1, 10],
        Ika: [8, 9],
        Oturupon: [2, 6],
        Otura: [5, 6],
        Irete: [3, 4],
        Ose: [7, 8],
        Eji: [1, 2],
      }).map(([e, a]) => [e, a]),
      e.i(46955),
      Array.from({ length: 64 }, (e, a) => ({
        number: a + 1,
        name: `Hexagrama ${a + 1}`,
        chineseName: `Hex${a + 1}`,
        judgment: 'Julgamento do hexagrama.',
        image: 'Imagem do hexagrama.',
        upperTrigram: (a % 8) + 1,
        lowerTrigram: (Math.floor(a / 8) % 8) + 1,
        lines: [
          a % 2 == 0,
          Math.floor(a / 2) % 2 == 0,
          Math.floor(a / 4) % 2 == 0,
          Math.floor(a / 8) % 2 == 0,
          Math.floor(a / 16) % 2 == 0,
          Math.floor(a / 32) % 2 == 0,
        ],
      })),
      e.s([], 80703),
      e.i(80703),
      ((o = i || (i = {})).assertEqual = (e) => {}),
      (o.assertIs = function (e) {}),
      (o.assertNever = function (e) {
        throw Error();
      }),
      (o.arrayToEnum = (e) => {
        let a = {};
        for (let o of e) a[o] = o;
        return a;
      }),
      (o.getValidEnumValues = (e) => {
        let a = o.objectKeys(e).filter((a) => 'number' != typeof e[e[a]]),
          r = {};
        for (let o of a) r[o] = e[o];
        return o.objectValues(r);
      }),
      (o.objectValues = (e) =>
        o.objectKeys(e).map(function (a) {
          return e[a];
        })),
      (o.objectKeys =
        'function' == typeof Object.keys
          ? (e) => Object.keys(e)
          : (e) => {
              let a = [];
              for (let o in e) Object.prototype.hasOwnProperty.call(e, o) && a.push(o);
              return a;
            }),
      (o.find = (e, a) => {
        for (let o of e) if (a(o)) return o;
      }),
      (o.isInteger =
        'function' == typeof Number.isInteger
          ? (e) => Number.isInteger(e)
          : (e) => 'number' == typeof e && Number.isFinite(e) && Math.floor(e) === e),
      (o.joinValues = function (e, a = ' | ') {
        return e.map((e) => ('string' == typeof e ? `'${e}'` : e)).join(a);
      }),
      (o.jsonStringifyReplacer = (e, a) => ('bigint' == typeof a ? a.toString() : a)),
      ((s || (s = {})).mergeShapes = (e, a) => ({ ...e, ...a })));
    let l = i.arrayToEnum([
        'string',
        'nan',
        'number',
        'integer',
        'float',
        'boolean',
        'date',
        'bigint',
        'symbol',
        'function',
        'undefined',
        'null',
        'array',
        'object',
        'unknown',
        'promise',
        'void',
        'never',
        'map',
        'set',
      ]),
      p = (e) => {
        switch (typeof e) {
          case 'undefined':
            return l.undefined;
          case 'string':
            return l.string;
          case 'number':
            return Number.isNaN(e) ? l.nan : l.number;
          case 'boolean':
            return l.boolean;
          case 'function':
            return l.function;
          case 'bigint':
            return l.bigint;
          case 'symbol':
            return l.symbol;
          case 'object':
            if (Array.isArray(e)) return l.array;
            if (null === e) return l.null;
            if (e.then && 'function' == typeof e.then && e.catch && 'function' == typeof e.catch)
              return l.promise;
            if ('u' > typeof Map && e instanceof Map) return l.map;
            if ('u' > typeof Set && e instanceof Set) return l.set;
            if ('u' > typeof Date && e instanceof Date) return l.date;
            return l.object;
          default:
            return l.unknown;
        }
      };
    e.s(['ZodParsedType', 0, l, 'getParsedType', 0, p, 'objectUtil', 0, s, 'util', 0, i], 58728);
    let h = i.arrayToEnum([
        'invalid_type',
        'invalid_literal',
        'custom',
        'invalid_union',
        'invalid_union_discriminator',
        'invalid_enum_value',
        'unrecognized_keys',
        'invalid_arguments',
        'invalid_return_type',
        'invalid_date',
        'invalid_string',
        'too_small',
        'too_big',
        'invalid_intersection_types',
        'not_multiple_of',
        'not_finite',
      ]),
      f = (e) => JSON.stringify(e, null, 2).replace(/"([^"]+)":/g, '$1:');
    class v extends Error {
      get errors() {
        return this.issues;
      }
      constructor(e) {
        (super(),
          (this.issues = []),
          (this.addIssue = (e) => {
            this.issues = [...this.issues, e];
          }),
          (this.addIssues = (e = []) => {
            this.issues = [...this.issues, ...e];
          }));
        const a = new.target.prototype;
        (Object.setPrototypeOf ? Object.setPrototypeOf(this, a) : (this.__proto__ = a),
          (this.name = 'ZodError'),
          (this.issues = e));
      }
      format(e) {
        let a =
            e ||
            function (e) {
              return e.message;
            },
          o = { _errors: [] },
          r = (e) => {
            for (let t of e.issues)
              if ('invalid_union' === t.code) t.unionErrors.map(r);
              else if ('invalid_return_type' === t.code) r(t.returnTypeError);
              else if ('invalid_arguments' === t.code) r(t.argumentsError);
              else if (0 === t.path.length) o._errors.push(a(t));
              else {
                let e = o,
                  r = 0;
                for (; r < t.path.length; ) {
                  let o = t.path[r];
                  (r === t.path.length - 1
                    ? ((e[o] = e[o] || { _errors: [] }), e[o]._errors.push(a(t)))
                    : (e[o] = e[o] || { _errors: [] }),
                    (e = e[o]),
                    r++);
                }
              }
          };
        return (r(this), o);
      }
      static assert(e) {
        if (!(e instanceof v)) throw Error(`Not a ZodError: ${e}`);
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, i.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return 0 === this.issues.length;
      }
      flatten(e = (e) => e.message) {
        let a = {},
          o = [];
        for (let r of this.issues)
          if (r.path.length > 0) {
            let o = r.path[0];
            ((a[o] = a[o] || []), a[o].push(e(r)));
          } else o.push(e(r));
        return { formErrors: o, fieldErrors: a };
      }
      get formErrors() {
        return this.flatten();
      }
    }
    ((v.create = (e) => new v(e)),
      e.s(['ZodError', 0, v, 'ZodIssueCode', 0, h, 'quotelessJson', 0, f], 9826));
    let g = (e, a) => {
        let o;
        switch (e.code) {
          case h.invalid_type:
            o =
              e.received === l.undefined
                ? 'Required'
                : `Expected ${e.expected}, received ${e.received}`;
            break;
          case h.invalid_literal:
            o = `Invalid literal value, expected ${JSON.stringify(e.expected, i.jsonStringifyReplacer)}`;
            break;
          case h.unrecognized_keys:
            o = `Unrecognized key(s) in object: ${i.joinValues(e.keys, ', ')}`;
            break;
          case h.invalid_union:
            o = 'Invalid input';
            break;
          case h.invalid_union_discriminator:
            o = `Invalid discriminator value. Expected ${i.joinValues(e.options)}`;
            break;
          case h.invalid_enum_value:
            o = `Invalid enum value. Expected ${i.joinValues(e.options)}, received '${e.received}'`;
            break;
          case h.invalid_arguments:
            o = 'Invalid function arguments';
            break;
          case h.invalid_return_type:
            o = 'Invalid function return type';
            break;
          case h.invalid_date:
            o = 'Invalid date';
            break;
          case h.invalid_string:
            'object' == typeof e.validation
              ? 'includes' in e.validation
                ? ((o = `Invalid input: must include "${e.validation.includes}"`),
                  'number' == typeof e.validation.position &&
                    (o = `${o} at one or more positions greater than or equal to ${e.validation.position}`))
                : 'startsWith' in e.validation
                  ? (o = `Invalid input: must start with "${e.validation.startsWith}"`)
                  : 'endsWith' in e.validation
                    ? (o = `Invalid input: must end with "${e.validation.endsWith}"`)
                    : i.assertNever(e.validation)
              : (o = 'regex' !== e.validation ? `Invalid ${e.validation}` : 'Invalid');
            break;
          case h.too_small:
            o =
              'array' === e.type
                ? `Array must contain ${e.exact ? 'exactly' : e.inclusive ? 'at least' : 'more than'} ${e.minimum} element(s)`
                : 'string' === e.type
                  ? `String must contain ${e.exact ? 'exactly' : e.inclusive ? 'at least' : 'over'} ${e.minimum} character(s)`
                  : 'number' === e.type || 'bigint' === e.type
                    ? `Number must be ${e.exact ? 'exactly equal to ' : e.inclusive ? 'greater than or equal to ' : 'greater than '}${e.minimum}`
                    : 'date' === e.type
                      ? `Date must be ${e.exact ? 'exactly equal to ' : e.inclusive ? 'greater than or equal to ' : 'greater than '}${new Date(Number(e.minimum))}`
                      : 'Invalid input';
            break;
          case h.too_big:
            o =
              'array' === e.type
                ? `Array must contain ${e.exact ? 'exactly' : e.inclusive ? 'at most' : 'less than'} ${e.maximum} element(s)`
                : 'string' === e.type
                  ? `String must contain ${e.exact ? 'exactly' : e.inclusive ? 'at most' : 'under'} ${e.maximum} character(s)`
                  : 'number' === e.type
                    ? `Number must be ${e.exact ? 'exactly' : e.inclusive ? 'less than or equal to' : 'less than'} ${e.maximum}`
                    : 'bigint' === e.type
                      ? `BigInt must be ${e.exact ? 'exactly' : e.inclusive ? 'less than or equal to' : 'less than'} ${e.maximum}`
                      : 'date' === e.type
                        ? `Date must be ${e.exact ? 'exactly' : e.inclusive ? 'smaller than or equal to' : 'smaller than'} ${new Date(Number(e.maximum))}`
                        : 'Invalid input';
            break;
          case h.custom:
            o = 'Invalid input';
            break;
          case h.invalid_intersection_types:
            o = 'Intersection results could not be merged';
            break;
          case h.not_multiple_of:
            o = `Number must be a multiple of ${e.multipleOf}`;
            break;
          case h.not_finite:
            o = 'Number must be finite';
            break;
          default:
            ((o = a.defaultError), i.assertNever(e));
        }
        return { message: o };
      },
      y = g;
    function b(e) {
      y = e;
    }
    function _() {
      return y;
    }
    (e.s(['getErrorMap', 0, _, 'setErrorMap', 0, b], 25827),
      e.i(25827),
      e.s(['defaultErrorMap', 0, g, 'getErrorMap', 0, _, 'setErrorMap', 0, b], 79407),
      e.i(79407));
    let q = (e) => {
        let { data: a, path: o, errorMaps: r, issueData: t } = e,
          i = [...o, ...(t.path || [])],
          s = { ...t, path: i };
        if (void 0 !== t.message) return { ...t, path: i, message: t.message };
        let n = '';
        for (let e of r
          .filter((e) => !!e)
          .slice()
          .reverse())
          n = e(s, { data: a, defaultError: n }).message;
        return { ...t, path: i, message: n };
      },
      x = [];
    function O(e, a) {
      let o = _(),
        r = q({
          issueData: a,
          data: e.data,
          path: e.path,
          errorMaps: [
            e.common.contextualErrorMap,
            e.schemaErrorMap,
            o,
            o === g ? void 0 : g,
          ].filter((e) => !!e),
        });
      e.common.issues.push(r);
    }
    class A {
      constructor() {
        this.value = 'valid';
      }
      dirty() {
        'valid' === this.value && (this.value = 'dirty');
      }
      abort() {
        'aborted' !== this.value && (this.value = 'aborted');
      }
      static mergeArray(e, a) {
        let o = [];
        for (let r of a) {
          if ('aborted' === r.status) return E;
          ('dirty' === r.status && e.dirty(), o.push(r.value));
        }
        return { status: e.value, value: o };
      }
      static async mergeObjectAsync(e, a) {
        let o = [];
        for (let e of a) {
          let a = await e.key,
            r = await e.value;
          o.push({ key: a, value: r });
        }
        return A.mergeObjectSync(e, o);
      }
      static mergeObjectSync(e, a) {
        let o = {};
        for (let r of a) {
          let { key: a, value: t } = r;
          if ('aborted' === a.status || 'aborted' === t.status) return E;
          ('dirty' === a.status && e.dirty(),
            'dirty' === t.status && e.dirty(),
            '__proto__' !== a.value &&
              (void 0 !== t.value || r.alwaysSet) &&
              (o[a.value] = t.value));
        }
        return { status: e.value, value: o };
      }
    }
    let E = Object.freeze({ status: 'aborted' }),
      k = (e) => ({ status: 'dirty', value: e }),
      w = (e) => ({ status: 'valid', value: e }),
      N = (e) => 'aborted' === e.status,
      S = (e) => 'dirty' === e.status,
      P = (e) => 'valid' === e.status,
      T = (e) => 'u' > typeof Promise && e instanceof Promise;
    (e.s(
      [
        'DIRTY',
        0,
        k,
        'EMPTY_PATH',
        0,
        x,
        'INVALID',
        0,
        E,
        'OK',
        0,
        w,
        'ParseStatus',
        0,
        A,
        'addIssueToContext',
        0,
        O,
        'isAborted',
        0,
        N,
        'isAsync',
        0,
        T,
        'isDirty',
        0,
        S,
        'isValid',
        0,
        P,
        'makeIssue',
        0,
        q,
      ],
      96555
    ),
      e.i(96555),
      e.s([], 24326),
      e.i(24326),
      e.i(58728),
      ((r = n || (n = {})).errToObj = (e) => ('string' == typeof e ? { message: e } : e || {})),
      (r.toString = (e) => ('string' == typeof e ? e : e?.message)));
    class I {
      constructor(e, a, o, r) {
        ((this._cachedPath = []),
          (this.parent = e),
          (this.data = a),
          (this._path = o),
          (this._key = r));
      }
      get path() {
        return (
          this._cachedPath.length ||
            (Array.isArray(this._key)
              ? this._cachedPath.push(...this._path, ...this._key)
              : this._cachedPath.push(...this._path, this._key)),
          this._cachedPath
        );
      }
    }
    let C = (e, a) => {
      if (P(a)) return { success: !0, data: a.value };
      if (!e.common.issues.length) throw Error('Validation failed but no issues detected.');
      return {
        success: !1,
        get error() {
          if (this._error) return this._error;
          let a = new v(e.common.issues);
          return ((this._error = a), this._error);
        },
      };
    };
    function z(e) {
      if (!e) return {};
      let { errorMap: a, invalid_type_error: o, required_error: r, description: t } = e;
      if (a && (o || r))
        throw Error(
          'Can\'t use "invalid_type_error" or "required_error" in conjunction with custom error map.'
        );
      return a
        ? { errorMap: a, description: t }
        : {
            errorMap: (a, t) => {
              let { message: i } = e;
              return 'invalid_enum_value' === a.code
                ? { message: i ?? t.defaultError }
                : void 0 === t.data
                  ? { message: i ?? r ?? t.defaultError }
                  : 'invalid_type' !== a.code
                    ? { message: t.defaultError }
                    : { message: i ?? o ?? t.defaultError };
            },
            description: t,
          };
    }
    class Z {
      get description() {
        return this._def.description;
      }
      _getType(e) {
        return p(e.data);
      }
      _getOrReturnCtx(e, a) {
        return (
          a || {
            common: e.parent.common,
            data: e.data,
            parsedType: p(e.data),
            schemaErrorMap: this._def.errorMap,
            path: e.path,
            parent: e.parent,
          }
        );
      }
      _processInputParams(e) {
        return {
          status: new A(),
          ctx: {
            common: e.parent.common,
            data: e.data,
            parsedType: p(e.data),
            schemaErrorMap: this._def.errorMap,
            path: e.path,
            parent: e.parent,
          },
        };
      }
      _parseSync(e) {
        let a = this._parse(e);
        if (T(a)) throw Error('Synchronous parse encountered promise.');
        return a;
      }
      _parseAsync(e) {
        return Promise.resolve(this._parse(e));
      }
      parse(e, a) {
        let o = this.safeParse(e, a);
        if (o.success) return o.data;
        throw o.error;
      }
      safeParse(e, a) {
        let o = {
            common: { issues: [], async: a?.async ?? !1, contextualErrorMap: a?.errorMap },
            path: a?.path || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data: e,
            parsedType: p(e),
          },
          r = this._parseSync({ data: e, path: o.path, parent: o });
        return C(o, r);
      }
      '~validate'(e) {
        let a = {
          common: { issues: [], async: !!this['~standard'].async },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data: e,
          parsedType: p(e),
        };
        if (!this['~standard'].async)
          try {
            let o = this._parseSync({ data: e, path: [], parent: a });
            return P(o) ? { value: o.value } : { issues: a.common.issues };
          } catch (e) {
            (e?.message?.toLowerCase()?.includes('encountered') && (this['~standard'].async = !0),
              (a.common = { issues: [], async: !0 }));
          }
        return this._parseAsync({ data: e, path: [], parent: a }).then((e) =>
          P(e) ? { value: e.value } : { issues: a.common.issues }
        );
      }
      async parseAsync(e, a) {
        let o = await this.safeParseAsync(e, a);
        if (o.success) return o.data;
        throw o.error;
      }
      async safeParseAsync(e, a) {
        let o = {
            common: { issues: [], contextualErrorMap: a?.errorMap, async: !0 },
            path: a?.path || [],
            schemaErrorMap: this._def.errorMap,
            parent: null,
            data: e,
            parsedType: p(e),
          },
          r = this._parse({ data: e, path: o.path, parent: o });
        return C(o, await (T(r) ? r : Promise.resolve(r)));
      }
      refine(e, a) {
        return this._refinement((o, r) => {
          let t = e(o),
            i = () =>
              r.addIssue({
                code: h.custom,
                ...('string' == typeof a || void 0 === a
                  ? { message: a }
                  : 'function' == typeof a
                    ? a(o)
                    : a),
              });
          return 'u' > typeof Promise && t instanceof Promise
            ? t.then((e) => !!e || (i(), !1))
            : !!t || (i(), !1);
        });
      }
      refinement(e, a) {
        return this._refinement(
          (o, r) => !!e(o) || (r.addIssue('function' == typeof a ? a(o, r) : a), !1)
        );
      }
      _refinement(e) {
        return new eS({
          schema: this,
          typeName: d.ZodEffects,
          effect: { type: 'refinement', refinement: e },
        });
      }
      superRefine(e) {
        return this._refinement(e);
      }
      constructor(e) {
        ((this.spa = this.safeParseAsync),
          (this._def = e),
          (this.parse = this.parse.bind(this)),
          (this.safeParse = this.safeParse.bind(this)),
          (this.parseAsync = this.parseAsync.bind(this)),
          (this.safeParseAsync = this.safeParseAsync.bind(this)),
          (this.spa = this.spa.bind(this)),
          (this.refine = this.refine.bind(this)),
          (this.refinement = this.refinement.bind(this)),
          (this.superRefine = this.superRefine.bind(this)),
          (this.optional = this.optional.bind(this)),
          (this.nullable = this.nullable.bind(this)),
          (this.nullish = this.nullish.bind(this)),
          (this.array = this.array.bind(this)),
          (this.promise = this.promise.bind(this)),
          (this.or = this.or.bind(this)),
          (this.and = this.and.bind(this)),
          (this.transform = this.transform.bind(this)),
          (this.brand = this.brand.bind(this)),
          (this.default = this.default.bind(this)),
          (this.catch = this.catch.bind(this)),
          (this.describe = this.describe.bind(this)),
          (this.pipe = this.pipe.bind(this)),
          (this.readonly = this.readonly.bind(this)),
          (this.isNullable = this.isNullable.bind(this)),
          (this.isOptional = this.isOptional.bind(this)),
          (this['~standard'] = {
            version: 1,
            vendor: 'zod',
            validate: (e) => this['~validate'](e),
          }));
      }
      optional() {
        return eP.create(this, this._def);
      }
      nullable() {
        return eT.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return el.create(this);
      }
      promise() {
        return eN.create(this, this._def);
      }
      or(e) {
        return eh.create([this, e], this._def);
      }
      and(e) {
        return eg.create(this, e, this._def);
      }
      transform(e) {
        return new eS({
          ...z(this._def),
          schema: this,
          typeName: d.ZodEffects,
          effect: { type: 'transform', transform: e },
        });
      }
      default(e) {
        return new eI({
          ...z(this._def),
          innerType: this,
          defaultValue: 'function' == typeof e ? e : () => e,
          typeName: d.ZodDefault,
        });
      }
      brand() {
        return new eR({ typeName: d.ZodBranded, type: this, ...z(this._def) });
      }
      catch(e) {
        return new eC({
          ...z(this._def),
          innerType: this,
          catchValue: 'function' == typeof e ? e : () => e,
          typeName: d.ZodCatch,
        });
      }
      describe(e) {
        return new this.constructor({ ...this._def, description: e });
      }
      pipe(e) {
        return ej.create(this, e);
      }
      readonly() {
        return eD.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    }
    let R = /^c[^\s-]{8,}$/i,
      j = /^[0-9a-z]+$/,
      D = /^[0-9A-HJKMNP-TV-Z]{26}$/i,
      V = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i,
      M = /^[a-z0-9_-]{21}$/i,
      F = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
      $ =
        /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,
      U = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i,
      L =
        /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
      B =
        /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
      Y =
        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
      K =
        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
      H = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
      W = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
      Q =
        '((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))',
      G = RegExp(`^${Q}$`);
    function J(e) {
      let a = '[0-5]\\d';
      e.precision
        ? (a = `${a}\\.\\d{${e.precision}}`)
        : null == e.precision && (a = `${a}(\\.\\d+)?`);
      let o = e.precision ? '+' : '?';
      return `([01]\\d|2[0-3]):[0-5]\\d(:${a})${o}`;
    }
    function X(e) {
      let a = `${Q}T${J(e)}`,
        o = [];
      return (
        o.push(e.local ? 'Z?' : 'Z'),
        e.offset && o.push('([+-]\\d{2}:?\\d{2})'),
        (a = `${a}(${o.join('|')})`),
        RegExp(`^${a}$`)
      );
    }
    class ee extends Z {
      _parse(e) {
        var o, r, t, s;
        let n;
        if ((this._def.coerce && (e.data = String(e.data)), this._getType(e) !== l.string)) {
          let a = this._getOrReturnCtx(e);
          return (O(a, { code: h.invalid_type, expected: l.string, received: a.parsedType }), E);
        }
        let d = new A();
        for (let u of this._def.checks)
          if ('min' === u.kind)
            e.data.length < u.value &&
              (O((n = this._getOrReturnCtx(e, n)), {
                code: h.too_small,
                minimum: u.value,
                type: 'string',
                inclusive: !0,
                exact: !1,
                message: u.message,
              }),
              d.dirty());
          else if ('max' === u.kind)
            e.data.length > u.value &&
              (O((n = this._getOrReturnCtx(e, n)), {
                code: h.too_big,
                maximum: u.value,
                type: 'string',
                inclusive: !0,
                exact: !1,
                message: u.message,
              }),
              d.dirty());
          else if ('length' === u.kind) {
            let a = e.data.length > u.value,
              o = e.data.length < u.value;
            (a || o) &&
              ((n = this._getOrReturnCtx(e, n)),
              a
                ? O(n, {
                    code: h.too_big,
                    maximum: u.value,
                    type: 'string',
                    inclusive: !0,
                    exact: !0,
                    message: u.message,
                  })
                : o &&
                  O(n, {
                    code: h.too_small,
                    minimum: u.value,
                    type: 'string',
                    inclusive: !0,
                    exact: !0,
                    message: u.message,
                  }),
              d.dirty());
          } else if ('email' === u.kind)
            U.test(e.data) ||
              (O((n = this._getOrReturnCtx(e, n)), {
                validation: 'email',
                code: h.invalid_string,
                message: u.message,
              }),
              d.dirty());
          else if ('emoji' === u.kind)
            (a || (a = RegExp('^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$', 'u')),
              a.test(e.data) ||
                (O((n = this._getOrReturnCtx(e, n)), {
                  validation: 'emoji',
                  code: h.invalid_string,
                  message: u.message,
                }),
                d.dirty()));
          else if ('uuid' === u.kind)
            V.test(e.data) ||
              (O((n = this._getOrReturnCtx(e, n)), {
                validation: 'uuid',
                code: h.invalid_string,
                message: u.message,
              }),
              d.dirty());
          else if ('nanoid' === u.kind)
            M.test(e.data) ||
              (O((n = this._getOrReturnCtx(e, n)), {
                validation: 'nanoid',
                code: h.invalid_string,
                message: u.message,
              }),
              d.dirty());
          else if ('cuid' === u.kind)
            R.test(e.data) ||
              (O((n = this._getOrReturnCtx(e, n)), {
                validation: 'cuid',
                code: h.invalid_string,
                message: u.message,
              }),
              d.dirty());
          else if ('cuid2' === u.kind)
            j.test(e.data) ||
              (O((n = this._getOrReturnCtx(e, n)), {
                validation: 'cuid2',
                code: h.invalid_string,
                message: u.message,
              }),
              d.dirty());
          else if ('ulid' === u.kind)
            D.test(e.data) ||
              (O((n = this._getOrReturnCtx(e, n)), {
                validation: 'ulid',
                code: h.invalid_string,
                message: u.message,
              }),
              d.dirty());
          else if ('url' === u.kind)
            try {
              new URL(e.data);
            } catch {
              (O((n = this._getOrReturnCtx(e, n)), {
                validation: 'url',
                code: h.invalid_string,
                message: u.message,
              }),
                d.dirty());
            }
          else
            'regex' === u.kind
              ? ((u.regex.lastIndex = 0),
                u.regex.test(e.data) ||
                  (O((n = this._getOrReturnCtx(e, n)), {
                    validation: 'regex',
                    code: h.invalid_string,
                    message: u.message,
                  }),
                  d.dirty()))
              : 'trim' === u.kind
                ? (e.data = e.data.trim())
                : 'includes' === u.kind
                  ? e.data.includes(u.value, u.position) ||
                    (O((n = this._getOrReturnCtx(e, n)), {
                      code: h.invalid_string,
                      validation: { includes: u.value, position: u.position },
                      message: u.message,
                    }),
                    d.dirty())
                  : 'toLowerCase' === u.kind
                    ? (e.data = e.data.toLowerCase())
                    : 'toUpperCase' === u.kind
                      ? (e.data = e.data.toUpperCase())
                      : 'startsWith' === u.kind
                        ? e.data.startsWith(u.value) ||
                          (O((n = this._getOrReturnCtx(e, n)), {
                            code: h.invalid_string,
                            validation: { startsWith: u.value },
                            message: u.message,
                          }),
                          d.dirty())
                        : 'endsWith' === u.kind
                          ? e.data.endsWith(u.value) ||
                            (O((n = this._getOrReturnCtx(e, n)), {
                              code: h.invalid_string,
                              validation: { endsWith: u.value },
                              message: u.message,
                            }),
                            d.dirty())
                          : 'datetime' === u.kind
                            ? X(u).test(e.data) ||
                              (O((n = this._getOrReturnCtx(e, n)), {
                                code: h.invalid_string,
                                validation: 'datetime',
                                message: u.message,
                              }),
                              d.dirty())
                            : 'date' === u.kind
                              ? G.test(e.data) ||
                                (O((n = this._getOrReturnCtx(e, n)), {
                                  code: h.invalid_string,
                                  validation: 'date',
                                  message: u.message,
                                }),
                                d.dirty())
                              : 'time' === u.kind
                                ? RegExp(`^${J(u)}$`).test(e.data) ||
                                  (O((n = this._getOrReturnCtx(e, n)), {
                                    code: h.invalid_string,
                                    validation: 'time',
                                    message: u.message,
                                  }),
                                  d.dirty())
                                : 'duration' === u.kind
                                  ? $.test(e.data) ||
                                    (O((n = this._getOrReturnCtx(e, n)), {
                                      validation: 'duration',
                                      code: h.invalid_string,
                                      message: u.message,
                                    }),
                                    d.dirty())
                                  : 'ip' === u.kind
                                    ? ((o = e.data),
                                      !(
                                        (('v4' === (r = u.version) || !r) && L.test(o)) ||
                                        (('v6' === r || !r) && Y.test(o))
                                      ) &&
                                        1 &&
                                        (O((n = this._getOrReturnCtx(e, n)), {
                                          validation: 'ip',
                                          code: h.invalid_string,
                                          message: u.message,
                                        }),
                                        d.dirty()))
                                    : 'jwt' === u.kind
                                      ? !(function (e, a) {
                                          if (!F.test(e)) return !1;
                                          try {
                                            let [o] = e.split('.');
                                            if (!o) return !1;
                                            let r = o
                                                .replace(/-/g, '+')
                                                .replace(/_/g, '/')
                                                .padEnd(o.length + ((4 - (o.length % 4)) % 4), '='),
                                              t = JSON.parse(atob(r));
                                            if (
                                              'object' != typeof t ||
                                              null === t ||
                                              ('typ' in t && t?.typ !== 'JWT') ||
                                              !t.alg ||
                                              (a && t.alg !== a)
                                            )
                                              return !1;
                                            return !0;
                                          } catch {
                                            return !1;
                                          }
                                        })(e.data, u.alg) &&
                                        (O((n = this._getOrReturnCtx(e, n)), {
                                          validation: 'jwt',
                                          code: h.invalid_string,
                                          message: u.message,
                                        }),
                                        d.dirty())
                                      : 'cidr' === u.kind
                                        ? ((t = e.data),
                                          !(
                                            (('v4' === (s = u.version) || !s) && B.test(t)) ||
                                            (('v6' === s || !s) && K.test(t))
                                          ) &&
                                            1 &&
                                            (O((n = this._getOrReturnCtx(e, n)), {
                                              validation: 'cidr',
                                              code: h.invalid_string,
                                              message: u.message,
                                            }),
                                            d.dirty()))
                                        : 'base64' === u.kind
                                          ? H.test(e.data) ||
                                            (O((n = this._getOrReturnCtx(e, n)), {
                                              validation: 'base64',
                                              code: h.invalid_string,
                                              message: u.message,
                                            }),
                                            d.dirty())
                                          : 'base64url' === u.kind
                                            ? W.test(e.data) ||
                                              (O((n = this._getOrReturnCtx(e, n)), {
                                                validation: 'base64url',
                                                code: h.invalid_string,
                                                message: u.message,
                                              }),
                                              d.dirty())
                                            : i.assertNever(u);
        return { status: d.value, value: e.data };
      }
      _regex(e, a, o) {
        return this.refinement((a) => e.test(a), {
          validation: a,
          code: h.invalid_string,
          ...n.errToObj(o),
        });
      }
      _addCheck(e) {
        return new ee({ ...this._def, checks: [...this._def.checks, e] });
      }
      email(e) {
        return this._addCheck({ kind: 'email', ...n.errToObj(e) });
      }
      url(e) {
        return this._addCheck({ kind: 'url', ...n.errToObj(e) });
      }
      emoji(e) {
        return this._addCheck({ kind: 'emoji', ...n.errToObj(e) });
      }
      uuid(e) {
        return this._addCheck({ kind: 'uuid', ...n.errToObj(e) });
      }
      nanoid(e) {
        return this._addCheck({ kind: 'nanoid', ...n.errToObj(e) });
      }
      cuid(e) {
        return this._addCheck({ kind: 'cuid', ...n.errToObj(e) });
      }
      cuid2(e) {
        return this._addCheck({ kind: 'cuid2', ...n.errToObj(e) });
      }
      ulid(e) {
        return this._addCheck({ kind: 'ulid', ...n.errToObj(e) });
      }
      base64(e) {
        return this._addCheck({ kind: 'base64', ...n.errToObj(e) });
      }
      base64url(e) {
        return this._addCheck({ kind: 'base64url', ...n.errToObj(e) });
      }
      jwt(e) {
        return this._addCheck({ kind: 'jwt', ...n.errToObj(e) });
      }
      ip(e) {
        return this._addCheck({ kind: 'ip', ...n.errToObj(e) });
      }
      cidr(e) {
        return this._addCheck({ kind: 'cidr', ...n.errToObj(e) });
      }
      datetime(e) {
        return 'string' == typeof e
          ? this._addCheck({ kind: 'datetime', precision: null, offset: !1, local: !1, message: e })
          : this._addCheck({
              kind: 'datetime',
              precision: void 0 === e?.precision ? null : e?.precision,
              offset: e?.offset ?? !1,
              local: e?.local ?? !1,
              ...n.errToObj(e?.message),
            });
      }
      date(e) {
        return this._addCheck({ kind: 'date', message: e });
      }
      time(e) {
        return 'string' == typeof e
          ? this._addCheck({ kind: 'time', precision: null, message: e })
          : this._addCheck({
              kind: 'time',
              precision: void 0 === e?.precision ? null : e?.precision,
              ...n.errToObj(e?.message),
            });
      }
      duration(e) {
        return this._addCheck({ kind: 'duration', ...n.errToObj(e) });
      }
      regex(e, a) {
        return this._addCheck({ kind: 'regex', regex: e, ...n.errToObj(a) });
      }
      includes(e, a) {
        return this._addCheck({
          kind: 'includes',
          value: e,
          position: a?.position,
          ...n.errToObj(a?.message),
        });
      }
      startsWith(e, a) {
        return this._addCheck({ kind: 'startsWith', value: e, ...n.errToObj(a) });
      }
      endsWith(e, a) {
        return this._addCheck({ kind: 'endsWith', value: e, ...n.errToObj(a) });
      }
      min(e, a) {
        return this._addCheck({ kind: 'min', value: e, ...n.errToObj(a) });
      }
      max(e, a) {
        return this._addCheck({ kind: 'max', value: e, ...n.errToObj(a) });
      }
      length(e, a) {
        return this._addCheck({ kind: 'length', value: e, ...n.errToObj(a) });
      }
      nonempty(e) {
        return this.min(1, n.errToObj(e));
      }
      trim() {
        return new ee({ ...this._def, checks: [...this._def.checks, { kind: 'trim' }] });
      }
      toLowerCase() {
        return new ee({ ...this._def, checks: [...this._def.checks, { kind: 'toLowerCase' }] });
      }
      toUpperCase() {
        return new ee({ ...this._def, checks: [...this._def.checks, { kind: 'toUpperCase' }] });
      }
      get isDatetime() {
        return !!this._def.checks.find((e) => 'datetime' === e.kind);
      }
      get isDate() {
        return !!this._def.checks.find((e) => 'date' === e.kind);
      }
      get isTime() {
        return !!this._def.checks.find((e) => 'time' === e.kind);
      }
      get isDuration() {
        return !!this._def.checks.find((e) => 'duration' === e.kind);
      }
      get isEmail() {
        return !!this._def.checks.find((e) => 'email' === e.kind);
      }
      get isURL() {
        return !!this._def.checks.find((e) => 'url' === e.kind);
      }
      get isEmoji() {
        return !!this._def.checks.find((e) => 'emoji' === e.kind);
      }
      get isUUID() {
        return !!this._def.checks.find((e) => 'uuid' === e.kind);
      }
      get isNANOID() {
        return !!this._def.checks.find((e) => 'nanoid' === e.kind);
      }
      get isCUID() {
        return !!this._def.checks.find((e) => 'cuid' === e.kind);
      }
      get isCUID2() {
        return !!this._def.checks.find((e) => 'cuid2' === e.kind);
      }
      get isULID() {
        return !!this._def.checks.find((e) => 'ulid' === e.kind);
      }
      get isIP() {
        return !!this._def.checks.find((e) => 'ip' === e.kind);
      }
      get isCIDR() {
        return !!this._def.checks.find((e) => 'cidr' === e.kind);
      }
      get isBase64() {
        return !!this._def.checks.find((e) => 'base64' === e.kind);
      }
      get isBase64url() {
        return !!this._def.checks.find((e) => 'base64url' === e.kind);
      }
      get minLength() {
        let e = null;
        for (let a of this._def.checks)
          'min' === a.kind && (null === e || a.value > e) && (e = a.value);
        return e;
      }
      get maxLength() {
        let e = null;
        for (let a of this._def.checks)
          'max' === a.kind && (null === e || a.value < e) && (e = a.value);
        return e;
      }
    }
    ee.create = (e) =>
      new ee({ checks: [], typeName: d.ZodString, coerce: e?.coerce ?? !1, ...z(e) });
    class ea extends Z {
      constructor() {
        (super(...arguments),
          (this.min = this.gte),
          (this.max = this.lte),
          (this.step = this.multipleOf));
      }
      _parse(e) {
        let a;
        if ((this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== l.number)) {
          let a = this._getOrReturnCtx(e);
          return (O(a, { code: h.invalid_type, expected: l.number, received: a.parsedType }), E);
        }
        let o = new A();
        for (let r of this._def.checks)
          'int' === r.kind
            ? i.isInteger(e.data) ||
              (O((a = this._getOrReturnCtx(e, a)), {
                code: h.invalid_type,
                expected: 'integer',
                received: 'float',
                message: r.message,
              }),
              o.dirty())
            : 'min' === r.kind
              ? (r.inclusive ? e.data < r.value : e.data <= r.value) &&
                (O((a = this._getOrReturnCtx(e, a)), {
                  code: h.too_small,
                  minimum: r.value,
                  type: 'number',
                  inclusive: r.inclusive,
                  exact: !1,
                  message: r.message,
                }),
                o.dirty())
              : 'max' === r.kind
                ? (r.inclusive ? e.data > r.value : e.data >= r.value) &&
                  (O((a = this._getOrReturnCtx(e, a)), {
                    code: h.too_big,
                    maximum: r.value,
                    type: 'number',
                    inclusive: r.inclusive,
                    exact: !1,
                    message: r.message,
                  }),
                  o.dirty())
                : 'multipleOf' === r.kind
                  ? 0 !==
                      (function (e, a) {
                        let o = (e.toString().split('.')[1] || '').length,
                          r = (a.toString().split('.')[1] || '').length,
                          t = o > r ? o : r;
                        return (
                          (Number.parseInt(e.toFixed(t).replace('.', '')) %
                            Number.parseInt(a.toFixed(t).replace('.', ''))) /
                          10 ** t
                        );
                      })(e.data, r.value) &&
                    (O((a = this._getOrReturnCtx(e, a)), {
                      code: h.not_multiple_of,
                      multipleOf: r.value,
                      message: r.message,
                    }),
                    o.dirty())
                  : 'finite' === r.kind
                    ? Number.isFinite(e.data) ||
                      (O((a = this._getOrReturnCtx(e, a)), {
                        code: h.not_finite,
                        message: r.message,
                      }),
                      o.dirty())
                    : i.assertNever(r);
        return { status: o.value, value: e.data };
      }
      gte(e, a) {
        return this.setLimit('min', e, !0, n.toString(a));
      }
      gt(e, a) {
        return this.setLimit('min', e, !1, n.toString(a));
      }
      lte(e, a) {
        return this.setLimit('max', e, !0, n.toString(a));
      }
      lt(e, a) {
        return this.setLimit('max', e, !1, n.toString(a));
      }
      setLimit(e, a, o, r) {
        return new ea({
          ...this._def,
          checks: [
            ...this._def.checks,
            { kind: e, value: a, inclusive: o, message: n.toString(r) },
          ],
        });
      }
      _addCheck(e) {
        return new ea({ ...this._def, checks: [...this._def.checks, e] });
      }
      int(e) {
        return this._addCheck({ kind: 'int', message: n.toString(e) });
      }
      positive(e) {
        return this._addCheck({ kind: 'min', value: 0, inclusive: !1, message: n.toString(e) });
      }
      negative(e) {
        return this._addCheck({ kind: 'max', value: 0, inclusive: !1, message: n.toString(e) });
      }
      nonpositive(e) {
        return this._addCheck({ kind: 'max', value: 0, inclusive: !0, message: n.toString(e) });
      }
      nonnegative(e) {
        return this._addCheck({ kind: 'min', value: 0, inclusive: !0, message: n.toString(e) });
      }
      multipleOf(e, a) {
        return this._addCheck({ kind: 'multipleOf', value: e, message: n.toString(a) });
      }
      finite(e) {
        return this._addCheck({ kind: 'finite', message: n.toString(e) });
      }
      safe(e) {
        return this._addCheck({
          kind: 'min',
          inclusive: !0,
          value: Number.MIN_SAFE_INTEGER,
          message: n.toString(e),
        })._addCheck({
          kind: 'max',
          inclusive: !0,
          value: Number.MAX_SAFE_INTEGER,
          message: n.toString(e),
        });
      }
      get minValue() {
        let e = null;
        for (let a of this._def.checks)
          'min' === a.kind && (null === e || a.value > e) && (e = a.value);
        return e;
      }
      get maxValue() {
        let e = null;
        for (let a of this._def.checks)
          'max' === a.kind && (null === e || a.value < e) && (e = a.value);
        return e;
      }
      get isInt() {
        return !!this._def.checks.find(
          (e) => 'int' === e.kind || ('multipleOf' === e.kind && i.isInteger(e.value))
        );
      }
      get isFinite() {
        let e = null,
          a = null;
        for (let o of this._def.checks)
          if ('finite' === o.kind || 'int' === o.kind || 'multipleOf' === o.kind) return !0;
          else
            'min' === o.kind
              ? (null === a || o.value > a) && (a = o.value)
              : 'max' === o.kind && (null === e || o.value < e) && (e = o.value);
        return Number.isFinite(a) && Number.isFinite(e);
      }
    }
    ea.create = (e) =>
      new ea({ checks: [], typeName: d.ZodNumber, coerce: e?.coerce || !1, ...z(e) });
    class eo extends Z {
      constructor() {
        (super(...arguments), (this.min = this.gte), (this.max = this.lte));
      }
      _parse(e) {
        let a;
        if (this._def.coerce)
          try {
            e.data = BigInt(e.data);
          } catch {
            return this._getInvalidInput(e);
          }
        if (this._getType(e) !== l.bigint) return this._getInvalidInput(e);
        let o = new A();
        for (let r of this._def.checks)
          'min' === r.kind
            ? (r.inclusive ? e.data < r.value : e.data <= r.value) &&
              (O((a = this._getOrReturnCtx(e, a)), {
                code: h.too_small,
                type: 'bigint',
                minimum: r.value,
                inclusive: r.inclusive,
                message: r.message,
              }),
              o.dirty())
            : 'max' === r.kind
              ? (r.inclusive ? e.data > r.value : e.data >= r.value) &&
                (O((a = this._getOrReturnCtx(e, a)), {
                  code: h.too_big,
                  type: 'bigint',
                  maximum: r.value,
                  inclusive: r.inclusive,
                  message: r.message,
                }),
                o.dirty())
              : 'multipleOf' === r.kind
                ? e.data % r.value !== BigInt(0) &&
                  (O((a = this._getOrReturnCtx(e, a)), {
                    code: h.not_multiple_of,
                    multipleOf: r.value,
                    message: r.message,
                  }),
                  o.dirty())
                : i.assertNever(r);
        return { status: o.value, value: e.data };
      }
      _getInvalidInput(e) {
        let a = this._getOrReturnCtx(e);
        return (O(a, { code: h.invalid_type, expected: l.bigint, received: a.parsedType }), E);
      }
      gte(e, a) {
        return this.setLimit('min', e, !0, n.toString(a));
      }
      gt(e, a) {
        return this.setLimit('min', e, !1, n.toString(a));
      }
      lte(e, a) {
        return this.setLimit('max', e, !0, n.toString(a));
      }
      lt(e, a) {
        return this.setLimit('max', e, !1, n.toString(a));
      }
      setLimit(e, a, o, r) {
        return new eo({
          ...this._def,
          checks: [
            ...this._def.checks,
            { kind: e, value: a, inclusive: o, message: n.toString(r) },
          ],
        });
      }
      _addCheck(e) {
        return new eo({ ...this._def, checks: [...this._def.checks, e] });
      }
      positive(e) {
        return this._addCheck({
          kind: 'min',
          value: BigInt(0),
          inclusive: !1,
          message: n.toString(e),
        });
      }
      negative(e) {
        return this._addCheck({
          kind: 'max',
          value: BigInt(0),
          inclusive: !1,
          message: n.toString(e),
        });
      }
      nonpositive(e) {
        return this._addCheck({
          kind: 'max',
          value: BigInt(0),
          inclusive: !0,
          message: n.toString(e),
        });
      }
      nonnegative(e) {
        return this._addCheck({
          kind: 'min',
          value: BigInt(0),
          inclusive: !0,
          message: n.toString(e),
        });
      }
      multipleOf(e, a) {
        return this._addCheck({ kind: 'multipleOf', value: e, message: n.toString(a) });
      }
      get minValue() {
        let e = null;
        for (let a of this._def.checks)
          'min' === a.kind && (null === e || a.value > e) && (e = a.value);
        return e;
      }
      get maxValue() {
        let e = null;
        for (let a of this._def.checks)
          'max' === a.kind && (null === e || a.value < e) && (e = a.value);
        return e;
      }
    }
    eo.create = (e) =>
      new eo({ checks: [], typeName: d.ZodBigInt, coerce: e?.coerce ?? !1, ...z(e) });
    class er extends Z {
      _parse(e) {
        if ((this._def.coerce && (e.data = !!e.data), this._getType(e) !== l.boolean)) {
          let a = this._getOrReturnCtx(e);
          return (O(a, { code: h.invalid_type, expected: l.boolean, received: a.parsedType }), E);
        }
        return w(e.data);
      }
    }
    er.create = (e) => new er({ typeName: d.ZodBoolean, coerce: e?.coerce || !1, ...z(e) });
    class et extends Z {
      _parse(e) {
        let a;
        if ((this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== l.date)) {
          let a = this._getOrReturnCtx(e);
          return (O(a, { code: h.invalid_type, expected: l.date, received: a.parsedType }), E);
        }
        if (Number.isNaN(e.data.getTime()))
          return (O(this._getOrReturnCtx(e), { code: h.invalid_date }), E);
        let o = new A();
        for (let r of this._def.checks)
          'min' === r.kind
            ? e.data.getTime() < r.value &&
              (O((a = this._getOrReturnCtx(e, a)), {
                code: h.too_small,
                message: r.message,
                inclusive: !0,
                exact: !1,
                minimum: r.value,
                type: 'date',
              }),
              o.dirty())
            : 'max' === r.kind
              ? e.data.getTime() > r.value &&
                (O((a = this._getOrReturnCtx(e, a)), {
                  code: h.too_big,
                  message: r.message,
                  inclusive: !0,
                  exact: !1,
                  maximum: r.value,
                  type: 'date',
                }),
                o.dirty())
              : i.assertNever(r);
        return { status: o.value, value: new Date(e.data.getTime()) };
      }
      _addCheck(e) {
        return new et({ ...this._def, checks: [...this._def.checks, e] });
      }
      min(e, a) {
        return this._addCheck({ kind: 'min', value: e.getTime(), message: n.toString(a) });
      }
      max(e, a) {
        return this._addCheck({ kind: 'max', value: e.getTime(), message: n.toString(a) });
      }
      get minDate() {
        let e = null;
        for (let a of this._def.checks)
          'min' === a.kind && (null === e || a.value > e) && (e = a.value);
        return null != e ? new Date(e) : null;
      }
      get maxDate() {
        let e = null;
        for (let a of this._def.checks)
          'max' === a.kind && (null === e || a.value < e) && (e = a.value);
        return null != e ? new Date(e) : null;
      }
    }
    et.create = (e) =>
      new et({ checks: [], coerce: e?.coerce || !1, typeName: d.ZodDate, ...z(e) });
    class ei extends Z {
      _parse(e) {
        if (this._getType(e) !== l.symbol) {
          let a = this._getOrReturnCtx(e);
          return (O(a, { code: h.invalid_type, expected: l.symbol, received: a.parsedType }), E);
        }
        return w(e.data);
      }
    }
    ei.create = (e) => new ei({ typeName: d.ZodSymbol, ...z(e) });
    class es extends Z {
      _parse(e) {
        if (this._getType(e) !== l.undefined) {
          let a = this._getOrReturnCtx(e);
          return (O(a, { code: h.invalid_type, expected: l.undefined, received: a.parsedType }), E);
        }
        return w(e.data);
      }
    }
    es.create = (e) => new es({ typeName: d.ZodUndefined, ...z(e) });
    class en extends Z {
      _parse(e) {
        if (this._getType(e) !== l.null) {
          let a = this._getOrReturnCtx(e);
          return (O(a, { code: h.invalid_type, expected: l.null, received: a.parsedType }), E);
        }
        return w(e.data);
      }
    }
    en.create = (e) => new en({ typeName: d.ZodNull, ...z(e) });
    class ed extends Z {
      constructor() {
        (super(...arguments), (this._any = !0));
      }
      _parse(e) {
        return w(e.data);
      }
    }
    ed.create = (e) => new ed({ typeName: d.ZodAny, ...z(e) });
    class eu extends Z {
      constructor() {
        (super(...arguments), (this._unknown = !0));
      }
      _parse(e) {
        return w(e.data);
      }
    }
    eu.create = (e) => new eu({ typeName: d.ZodUnknown, ...z(e) });
    class ec extends Z {
      _parse(e) {
        let a = this._getOrReturnCtx(e);
        return (O(a, { code: h.invalid_type, expected: l.never, received: a.parsedType }), E);
      }
    }
    ec.create = (e) => new ec({ typeName: d.ZodNever, ...z(e) });
    class em extends Z {
      _parse(e) {
        if (this._getType(e) !== l.undefined) {
          let a = this._getOrReturnCtx(e);
          return (O(a, { code: h.invalid_type, expected: l.void, received: a.parsedType }), E);
        }
        return w(e.data);
      }
    }
    em.create = (e) => new em({ typeName: d.ZodVoid, ...z(e) });
    class el extends Z {
      _parse(e) {
        let { ctx: a, status: o } = this._processInputParams(e),
          r = this._def;
        if (a.parsedType !== l.array)
          return (O(a, { code: h.invalid_type, expected: l.array, received: a.parsedType }), E);
        if (null !== r.exactLength) {
          let e = a.data.length > r.exactLength.value,
            t = a.data.length < r.exactLength.value;
          (e || t) &&
            (O(a, {
              code: e ? h.too_big : h.too_small,
              minimum: t ? r.exactLength.value : void 0,
              maximum: e ? r.exactLength.value : void 0,
              type: 'array',
              inclusive: !0,
              exact: !0,
              message: r.exactLength.message,
            }),
            o.dirty());
        }
        if (
          (null !== r.minLength &&
            a.data.length < r.minLength.value &&
            (O(a, {
              code: h.too_small,
              minimum: r.minLength.value,
              type: 'array',
              inclusive: !0,
              exact: !1,
              message: r.minLength.message,
            }),
            o.dirty()),
          null !== r.maxLength &&
            a.data.length > r.maxLength.value &&
            (O(a, {
              code: h.too_big,
              maximum: r.maxLength.value,
              type: 'array',
              inclusive: !0,
              exact: !1,
              message: r.maxLength.message,
            }),
            o.dirty()),
          a.common.async)
        )
          return Promise.all(
            [...a.data].map((e, o) => r.type._parseAsync(new I(a, e, a.path, o)))
          ).then((e) => A.mergeArray(o, e));
        let t = [...a.data].map((e, o) => r.type._parseSync(new I(a, e, a.path, o)));
        return A.mergeArray(o, t);
      }
      get element() {
        return this._def.type;
      }
      min(e, a) {
        return new el({ ...this._def, minLength: { value: e, message: n.toString(a) } });
      }
      max(e, a) {
        return new el({ ...this._def, maxLength: { value: e, message: n.toString(a) } });
      }
      length(e, a) {
        return new el({ ...this._def, exactLength: { value: e, message: n.toString(a) } });
      }
      nonempty(e) {
        return this.min(1, e);
      }
    }
    el.create = (e, a) =>
      new el({
        type: e,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: d.ZodArray,
        ...z(a),
      });
    class ep extends Z {
      constructor() {
        (super(...arguments),
          (this._cached = null),
          (this.nonstrict = this.passthrough),
          (this.augment = this.extend));
      }
      _getCached() {
        if (null !== this._cached) return this._cached;
        let e = this._def.shape(),
          a = i.objectKeys(e);
        return ((this._cached = { shape: e, keys: a }), this._cached);
      }
      _parse(e) {
        if (this._getType(e) !== l.object) {
          let a = this._getOrReturnCtx(e);
          return (O(a, { code: h.invalid_type, expected: l.object, received: a.parsedType }), E);
        }
        let { status: a, ctx: o } = this._processInputParams(e),
          { shape: r, keys: t } = this._getCached(),
          i = [];
        if (!(this._def.catchall instanceof ec && 'strip' === this._def.unknownKeys))
          for (let e in o.data) t.includes(e) || i.push(e);
        let s = [];
        for (let e of t) {
          let a = r[e],
            t = o.data[e];
          s.push({
            key: { status: 'valid', value: e },
            value: a._parse(new I(o, t, o.path, e)),
            alwaysSet: e in o.data,
          });
        }
        if (this._def.catchall instanceof ec) {
          let e = this._def.unknownKeys;
          if ('passthrough' === e)
            for (let e of i)
              s.push({
                key: { status: 'valid', value: e },
                value: { status: 'valid', value: o.data[e] },
              });
          else if ('strict' === e)
            i.length > 0 && (O(o, { code: h.unrecognized_keys, keys: i }), a.dirty());
          else if ('strip' === e);
          else throw Error('Internal ZodObject error: invalid unknownKeys value.');
        } else {
          let e = this._def.catchall;
          for (let a of i) {
            let r = o.data[a];
            s.push({
              key: { status: 'valid', value: a },
              value: e._parse(new I(o, r, o.path, a)),
              alwaysSet: a in o.data,
            });
          }
        }
        return o.common.async
          ? Promise.resolve()
              .then(async () => {
                let e = [];
                for (let a of s) {
                  let o = await a.key,
                    r = await a.value;
                  e.push({ key: o, value: r, alwaysSet: a.alwaysSet });
                }
                return e;
              })
              .then((e) => A.mergeObjectSync(a, e))
          : A.mergeObjectSync(a, s);
      }
      get shape() {
        return this._def.shape();
      }
      strict(e) {
        return (
          n.errToObj,
          new ep({
            ...this._def,
            unknownKeys: 'strict',
            ...(void 0 !== e
              ? {
                  errorMap: (a, o) => {
                    let r = this._def.errorMap?.(a, o).message ?? o.defaultError;
                    return 'unrecognized_keys' === a.code
                      ? { message: n.errToObj(e).message ?? r }
                      : { message: r };
                  },
                }
              : {}),
          })
        );
      }
      strip() {
        return new ep({ ...this._def, unknownKeys: 'strip' });
      }
      passthrough() {
        return new ep({ ...this._def, unknownKeys: 'passthrough' });
      }
      extend(e) {
        return new ep({ ...this._def, shape: () => ({ ...this._def.shape(), ...e }) });
      }
      merge(e) {
        return new ep({
          unknownKeys: e._def.unknownKeys,
          catchall: e._def.catchall,
          shape: () => ({ ...this._def.shape(), ...e._def.shape() }),
          typeName: d.ZodObject,
        });
      }
      setKey(e, a) {
        return this.augment({ [e]: a });
      }
      catchall(e) {
        return new ep({ ...this._def, catchall: e });
      }
      pick(e) {
        let a = {};
        for (let o of i.objectKeys(e)) e[o] && this.shape[o] && (a[o] = this.shape[o]);
        return new ep({ ...this._def, shape: () => a });
      }
      omit(e) {
        let a = {};
        for (let o of i.objectKeys(this.shape)) e[o] || (a[o] = this.shape[o]);
        return new ep({ ...this._def, shape: () => a });
      }
      deepPartial() {
        return (function e(a) {
          if (a instanceof ep) {
            let o = {};
            for (let r in a.shape) {
              let t = a.shape[r];
              o[r] = eP.create(e(t));
            }
            return new ep({ ...a._def, shape: () => o });
          }
          if (a instanceof el) return new el({ ...a._def, type: e(a.element) });
          if (a instanceof eP) return eP.create(e(a.unwrap()));
          if (a instanceof eT) return eT.create(e(a.unwrap()));
          if (a instanceof ey) return ey.create(a.items.map((a) => e(a)));
          else return a;
        })(this);
      }
      partial(e) {
        let a = {};
        for (let o of i.objectKeys(this.shape)) {
          let r = this.shape[o];
          e && !e[o] ? (a[o] = r) : (a[o] = r.optional());
        }
        return new ep({ ...this._def, shape: () => a });
      }
      required(e) {
        let a = {};
        for (let o of i.objectKeys(this.shape))
          if (e && !e[o]) a[o] = this.shape[o];
          else {
            let e = this.shape[o];
            for (; e instanceof eP; ) e = e._def.innerType;
            a[o] = e;
          }
        return new ep({ ...this._def, shape: () => a });
      }
      keyof() {
        return eE(i.objectKeys(this.shape));
      }
    }
    ((ep.create = (e, a) =>
      new ep({
        shape: () => e,
        unknownKeys: 'strip',
        catchall: ec.create(),
        typeName: d.ZodObject,
        ...z(a),
      })),
      (ep.strictCreate = (e, a) =>
        new ep({
          shape: () => e,
          unknownKeys: 'strict',
          catchall: ec.create(),
          typeName: d.ZodObject,
          ...z(a),
        })),
      (ep.lazycreate = (e, a) =>
        new ep({
          shape: e,
          unknownKeys: 'strip',
          catchall: ec.create(),
          typeName: d.ZodObject,
          ...z(a),
        })));
    class eh extends Z {
      _parse(e) {
        let { ctx: a } = this._processInputParams(e),
          o = this._def.options;
        if (a.common.async)
          return Promise.all(
            o.map(async (e) => {
              let o = { ...a, common: { ...a.common, issues: [] }, parent: null };
              return {
                result: await e._parseAsync({ data: a.data, path: a.path, parent: o }),
                ctx: o,
              };
            })
          ).then(function (e) {
            for (let a of e) if ('valid' === a.result.status) return a.result;
            for (let o of e)
              if ('dirty' === o.result.status)
                return (a.common.issues.push(...o.ctx.common.issues), o.result);
            let o = e.map((e) => new v(e.ctx.common.issues));
            return (O(a, { code: h.invalid_union, unionErrors: o }), E);
          });
        {
          let e,
            r = [];
          for (let t of o) {
            let o = { ...a, common: { ...a.common, issues: [] }, parent: null },
              i = t._parseSync({ data: a.data, path: a.path, parent: o });
            if ('valid' === i.status) return i;
            ('dirty' !== i.status || e || (e = { result: i, ctx: o }),
              o.common.issues.length && r.push(o.common.issues));
          }
          if (e) return (a.common.issues.push(...e.ctx.common.issues), e.result);
          let t = r.map((e) => new v(e));
          return (O(a, { code: h.invalid_union, unionErrors: t }), E);
        }
      }
      get options() {
        return this._def.options;
      }
    }
    eh.create = (e, a) => new eh({ options: e, typeName: d.ZodUnion, ...z(a) });
    let ef = (e) => {
      if (e instanceof eO) return ef(e.schema);
      if (e instanceof eS) return ef(e.innerType());
      if (e instanceof eA) return [e.value];
      if (e instanceof ek) return e.options;
      if (e instanceof ew) return i.objectValues(e.enum);
      else if (e instanceof eI) return ef(e._def.innerType);
      else if (e instanceof es) return [void 0];
      else if (e instanceof en) return [null];
      else if (e instanceof eP) return [void 0, ...ef(e.unwrap())];
      else if (e instanceof eT) return [null, ...ef(e.unwrap())];
      else if (e instanceof eR) return ef(e.unwrap());
      else if (e instanceof eD) return ef(e.unwrap());
      else if (e instanceof eC) return ef(e._def.innerType);
      else return [];
    };
    class ev extends Z {
      _parse(e) {
        let { ctx: a } = this._processInputParams(e);
        if (a.parsedType !== l.object)
          return (O(a, { code: h.invalid_type, expected: l.object, received: a.parsedType }), E);
        let o = this.discriminator,
          r = a.data[o],
          t = this.optionsMap.get(r);
        return t
          ? a.common.async
            ? t._parseAsync({ data: a.data, path: a.path, parent: a })
            : t._parseSync({ data: a.data, path: a.path, parent: a })
          : (O(a, {
              code: h.invalid_union_discriminator,
              options: Array.from(this.optionsMap.keys()),
              path: [o],
            }),
            E);
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      static create(e, a, o) {
        let r = new Map();
        for (let o of a) {
          let a = ef(o.shape[e]);
          if (!a.length)
            throw Error(
              `A discriminator value for key \`${e}\` could not be extracted from all schema options`
            );
          for (let t of a) {
            if (r.has(t))
              throw Error(`Discriminator property ${String(e)} has duplicate value ${String(t)}`);
            r.set(t, o);
          }
        }
        return new ev({
          typeName: d.ZodDiscriminatedUnion,
          discriminator: e,
          options: a,
          optionsMap: r,
          ...z(o),
        });
      }
    }
    class eg extends Z {
      _parse(e) {
        let { status: a, ctx: o } = this._processInputParams(e),
          r = (e, r) => {
            if (N(e) || N(r)) return E;
            let t = (function e(a, o) {
              let r = p(a),
                t = p(o);
              if (a === o) return { valid: !0, data: a };
              if (r === l.object && t === l.object) {
                let r = i.objectKeys(o),
                  t = i.objectKeys(a).filter((e) => -1 !== r.indexOf(e)),
                  s = { ...a, ...o };
                for (let r of t) {
                  let t = e(a[r], o[r]);
                  if (!t.valid) return { valid: !1 };
                  s[r] = t.data;
                }
                return { valid: !0, data: s };
              }
              if (r === l.array && t === l.array) {
                if (a.length !== o.length) return { valid: !1 };
                let r = [];
                for (let t = 0; t < a.length; t++) {
                  let i = e(a[t], o[t]);
                  if (!i.valid) return { valid: !1 };
                  r.push(i.data);
                }
                return { valid: !0, data: r };
              }
              if (r === l.date && t === l.date && +a == +o) return { valid: !0, data: a };
              return { valid: !1 };
            })(e.value, r.value);
            return t.valid
              ? ((S(e) || S(r)) && a.dirty(), { status: a.value, value: t.data })
              : (O(o, { code: h.invalid_intersection_types }), E);
          };
        return o.common.async
          ? Promise.all([
              this._def.left._parseAsync({ data: o.data, path: o.path, parent: o }),
              this._def.right._parseAsync({ data: o.data, path: o.path, parent: o }),
            ]).then(([e, a]) => r(e, a))
          : r(
              this._def.left._parseSync({ data: o.data, path: o.path, parent: o }),
              this._def.right._parseSync({ data: o.data, path: o.path, parent: o })
            );
      }
    }
    eg.create = (e, a, o) => new eg({ left: e, right: a, typeName: d.ZodIntersection, ...z(o) });
    class ey extends Z {
      _parse(e) {
        let { status: a, ctx: o } = this._processInputParams(e);
        if (o.parsedType !== l.array)
          return (O(o, { code: h.invalid_type, expected: l.array, received: o.parsedType }), E);
        if (o.data.length < this._def.items.length)
          return (
            O(o, {
              code: h.too_small,
              minimum: this._def.items.length,
              inclusive: !0,
              exact: !1,
              type: 'array',
            }),
            E
          );
        !this._def.rest &&
          o.data.length > this._def.items.length &&
          (O(o, {
            code: h.too_big,
            maximum: this._def.items.length,
            inclusive: !0,
            exact: !1,
            type: 'array',
          }),
          a.dirty());
        let r = [...o.data]
          .map((e, a) => {
            let r = this._def.items[a] || this._def.rest;
            return r ? r._parse(new I(o, e, o.path, a)) : null;
          })
          .filter((e) => !!e);
        return o.common.async ? Promise.all(r).then((e) => A.mergeArray(a, e)) : A.mergeArray(a, r);
      }
      get items() {
        return this._def.items;
      }
      rest(e) {
        return new ey({ ...this._def, rest: e });
      }
    }
    ey.create = (e, a) => {
      if (!Array.isArray(e)) throw Error('You must pass an array of schemas to z.tuple([ ... ])');
      return new ey({ items: e, typeName: d.ZodTuple, rest: null, ...z(a) });
    };
    class eb extends Z {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(e) {
        let { status: a, ctx: o } = this._processInputParams(e);
        if (o.parsedType !== l.object)
          return (O(o, { code: h.invalid_type, expected: l.object, received: o.parsedType }), E);
        let r = [],
          t = this._def.keyType,
          i = this._def.valueType;
        for (let e in o.data)
          r.push({
            key: t._parse(new I(o, e, o.path, e)),
            value: i._parse(new I(o, o.data[e], o.path, e)),
            alwaysSet: e in o.data,
          });
        return o.common.async ? A.mergeObjectAsync(a, r) : A.mergeObjectSync(a, r);
      }
      get element() {
        return this._def.valueType;
      }
      static create(e, a, o) {
        return new eb(
          a instanceof Z
            ? { keyType: e, valueType: a, typeName: d.ZodRecord, ...z(o) }
            : { keyType: ee.create(), valueType: e, typeName: d.ZodRecord, ...z(a) }
        );
      }
    }
    class e_ extends Z {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(e) {
        let { status: a, ctx: o } = this._processInputParams(e);
        if (o.parsedType !== l.map)
          return (O(o, { code: h.invalid_type, expected: l.map, received: o.parsedType }), E);
        let r = this._def.keyType,
          t = this._def.valueType,
          i = [...o.data.entries()].map(([e, a], i) => ({
            key: r._parse(new I(o, e, o.path, [i, 'key'])),
            value: t._parse(new I(o, a, o.path, [i, 'value'])),
          }));
        if (o.common.async) {
          let e = new Map();
          return Promise.resolve().then(async () => {
            for (let o of i) {
              let r = await o.key,
                t = await o.value;
              if ('aborted' === r.status || 'aborted' === t.status) return E;
              (('dirty' === r.status || 'dirty' === t.status) && a.dirty(),
                e.set(r.value, t.value));
            }
            return { status: a.value, value: e };
          });
        }
        {
          let e = new Map();
          for (let o of i) {
            let r = o.key,
              t = o.value;
            if ('aborted' === r.status || 'aborted' === t.status) return E;
            (('dirty' === r.status || 'dirty' === t.status) && a.dirty(), e.set(r.value, t.value));
          }
          return { status: a.value, value: e };
        }
      }
    }
    e_.create = (e, a, o) => new e_({ valueType: a, keyType: e, typeName: d.ZodMap, ...z(o) });
    class eq extends Z {
      _parse(e) {
        let { status: a, ctx: o } = this._processInputParams(e);
        if (o.parsedType !== l.set)
          return (O(o, { code: h.invalid_type, expected: l.set, received: o.parsedType }), E);
        let r = this._def;
        (null !== r.minSize &&
          o.data.size < r.minSize.value &&
          (O(o, {
            code: h.too_small,
            minimum: r.minSize.value,
            type: 'set',
            inclusive: !0,
            exact: !1,
            message: r.minSize.message,
          }),
          a.dirty()),
          null !== r.maxSize &&
            o.data.size > r.maxSize.value &&
            (O(o, {
              code: h.too_big,
              maximum: r.maxSize.value,
              type: 'set',
              inclusive: !0,
              exact: !1,
              message: r.maxSize.message,
            }),
            a.dirty()));
        let t = this._def.valueType;
        function i(e) {
          let o = new Set();
          for (let r of e) {
            if ('aborted' === r.status) return E;
            ('dirty' === r.status && a.dirty(), o.add(r.value));
          }
          return { status: a.value, value: o };
        }
        let s = [...o.data.values()].map((e, a) => t._parse(new I(o, e, o.path, a)));
        return o.common.async ? Promise.all(s).then((e) => i(e)) : i(s);
      }
      min(e, a) {
        return new eq({ ...this._def, minSize: { value: e, message: n.toString(a) } });
      }
      max(e, a) {
        return new eq({ ...this._def, maxSize: { value: e, message: n.toString(a) } });
      }
      size(e, a) {
        return this.min(e, a).max(e, a);
      }
      nonempty(e) {
        return this.min(1, e);
      }
    }
    eq.create = (e, a) =>
      new eq({ valueType: e, minSize: null, maxSize: null, typeName: d.ZodSet, ...z(a) });
    class ex extends Z {
      constructor() {
        (super(...arguments), (this.validate = this.implement));
      }
      _parse(e) {
        let { ctx: a } = this._processInputParams(e);
        if (a.parsedType !== l.function)
          return (O(a, { code: h.invalid_type, expected: l.function, received: a.parsedType }), E);
        function o(e, o) {
          return q({
            data: e,
            path: a.path,
            errorMaps: [a.common.contextualErrorMap, a.schemaErrorMap, _(), g].filter((e) => !!e),
            issueData: { code: h.invalid_arguments, argumentsError: o },
          });
        }
        function r(e, o) {
          return q({
            data: e,
            path: a.path,
            errorMaps: [a.common.contextualErrorMap, a.schemaErrorMap, _(), g].filter((e) => !!e),
            issueData: { code: h.invalid_return_type, returnTypeError: o },
          });
        }
        let t = { errorMap: a.common.contextualErrorMap },
          i = a.data;
        if (this._def.returns instanceof eN) {
          let e = this;
          return w(async function (...a) {
            let s = new v([]),
              n = await e._def.args.parseAsync(a, t).catch((e) => {
                throw (s.addIssue(o(a, e)), s);
              }),
              d = await Reflect.apply(i, this, n);
            return await e._def.returns._def.type.parseAsync(d, t).catch((e) => {
              throw (s.addIssue(r(d, e)), s);
            });
          });
        }
        {
          let e = this;
          return w(function (...a) {
            let s = e._def.args.safeParse(a, t);
            if (!s.success) throw new v([o(a, s.error)]);
            let n = Reflect.apply(i, this, s.data),
              d = e._def.returns.safeParse(n, t);
            if (!d.success) throw new v([r(n, d.error)]);
            return d.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...e) {
        return new ex({ ...this._def, args: ey.create(e).rest(eu.create()) });
      }
      returns(e) {
        return new ex({ ...this._def, returns: e });
      }
      implement(e) {
        return this.parse(e);
      }
      strictImplement(e) {
        return this.parse(e);
      }
      static create(e, a, o) {
        return new ex({
          args: e || ey.create([]).rest(eu.create()),
          returns: a || eu.create(),
          typeName: d.ZodFunction,
          ...z(o),
        });
      }
    }
    class eO extends Z {
      get schema() {
        return this._def.getter();
      }
      _parse(e) {
        let { ctx: a } = this._processInputParams(e);
        return this._def.getter()._parse({ data: a.data, path: a.path, parent: a });
      }
    }
    eO.create = (e, a) => new eO({ getter: e, typeName: d.ZodLazy, ...z(a) });
    class eA extends Z {
      _parse(e) {
        if (e.data !== this._def.value) {
          let a = this._getOrReturnCtx(e);
          return (
            O(a, { received: a.data, code: h.invalid_literal, expected: this._def.value }),
            E
          );
        }
        return { status: 'valid', value: e.data };
      }
      get value() {
        return this._def.value;
      }
    }
    function eE(e, a) {
      return new ek({ values: e, typeName: d.ZodEnum, ...z(a) });
    }
    eA.create = (e, a) => new eA({ value: e, typeName: d.ZodLiteral, ...z(a) });
    class ek extends Z {
      _parse(e) {
        if ('string' != typeof e.data) {
          let a = this._getOrReturnCtx(e),
            o = this._def.values;
          return (
            O(a, { expected: i.joinValues(o), received: a.parsedType, code: h.invalid_type }),
            E
          );
        }
        if ((this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data))) {
          let a = this._getOrReturnCtx(e),
            o = this._def.values;
          return (O(a, { received: a.data, code: h.invalid_enum_value, options: o }), E);
        }
        return w(e.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        let e = {};
        for (let a of this._def.values) e[a] = a;
        return e;
      }
      get Values() {
        let e = {};
        for (let a of this._def.values) e[a] = a;
        return e;
      }
      get Enum() {
        let e = {};
        for (let a of this._def.values) e[a] = a;
        return e;
      }
      extract(e, a = this._def) {
        return ek.create(e, { ...this._def, ...a });
      }
      exclude(e, a = this._def) {
        return ek.create(
          this.options.filter((a) => !e.includes(a)),
          { ...this._def, ...a }
        );
      }
    }
    ek.create = eE;
    class ew extends Z {
      _parse(e) {
        let a = i.getValidEnumValues(this._def.values),
          o = this._getOrReturnCtx(e);
        if (o.parsedType !== l.string && o.parsedType !== l.number) {
          let e = i.objectValues(a);
          return (
            O(o, { expected: i.joinValues(e), received: o.parsedType, code: h.invalid_type }),
            E
          );
        }
        if (
          (this._cache || (this._cache = new Set(i.getValidEnumValues(this._def.values))),
          !this._cache.has(e.data))
        ) {
          let e = i.objectValues(a);
          return (O(o, { received: o.data, code: h.invalid_enum_value, options: e }), E);
        }
        return w(e.data);
      }
      get enum() {
        return this._def.values;
      }
    }
    ew.create = (e, a) => new ew({ values: e, typeName: d.ZodNativeEnum, ...z(a) });
    class eN extends Z {
      unwrap() {
        return this._def.type;
      }
      _parse(e) {
        let { ctx: a } = this._processInputParams(e);
        return a.parsedType !== l.promise && !1 === a.common.async
          ? (O(a, { code: h.invalid_type, expected: l.promise, received: a.parsedType }), E)
          : w(
              (a.parsedType === l.promise ? a.data : Promise.resolve(a.data)).then((e) =>
                this._def.type.parseAsync(e, {
                  path: a.path,
                  errorMap: a.common.contextualErrorMap,
                })
              )
            );
      }
    }
    eN.create = (e, a) => new eN({ type: e, typeName: d.ZodPromise, ...z(a) });
    class eS extends Z {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === d.ZodEffects
          ? this._def.schema.sourceType()
          : this._def.schema;
      }
      _parse(e) {
        let { status: a, ctx: o } = this._processInputParams(e),
          r = this._def.effect || null,
          t = {
            addIssue: (e) => {
              (O(o, e), e.fatal ? a.abort() : a.dirty());
            },
            get path() {
              return o.path;
            },
          };
        if (((t.addIssue = t.addIssue.bind(t)), 'preprocess' === r.type)) {
          let e = r.transform(o.data, t);
          if (o.common.async)
            return Promise.resolve(e).then(async (e) => {
              if ('aborted' === a.value) return E;
              let r = await this._def.schema._parseAsync({ data: e, path: o.path, parent: o });
              return 'aborted' === r.status
                ? E
                : 'dirty' === r.status || 'dirty' === a.value
                  ? k(r.value)
                  : r;
            });
          {
            if ('aborted' === a.value) return E;
            let r = this._def.schema._parseSync({ data: e, path: o.path, parent: o });
            return 'aborted' === r.status
              ? E
              : 'dirty' === r.status || 'dirty' === a.value
                ? k(r.value)
                : r;
          }
        }
        if ('refinement' === r.type) {
          let e = (e) => {
            let a = r.refinement(e, t);
            if (o.common.async) return Promise.resolve(a);
            if (a instanceof Promise)
              throw Error(
                'Async refinement encountered during synchronous parse operation. Use .parseAsync instead.'
              );
            return e;
          };
          if (!1 !== o.common.async)
            return this._def.schema
              ._parseAsync({ data: o.data, path: o.path, parent: o })
              .then((o) =>
                'aborted' === o.status
                  ? E
                  : ('dirty' === o.status && a.dirty(),
                    e(o.value).then(() => ({ status: a.value, value: o.value })))
              );
          {
            let r = this._def.schema._parseSync({ data: o.data, path: o.path, parent: o });
            return 'aborted' === r.status
              ? E
              : ('dirty' === r.status && a.dirty(),
                e(r.value),
                { status: a.value, value: r.value });
          }
        }
        if ('transform' === r.type)
          if (!1 !== o.common.async)
            return this._def.schema
              ._parseAsync({ data: o.data, path: o.path, parent: o })
              .then((e) =>
                P(e)
                  ? Promise.resolve(r.transform(e.value, t)).then((e) => ({
                      status: a.value,
                      value: e,
                    }))
                  : E
              );
          else {
            let e = this._def.schema._parseSync({ data: o.data, path: o.path, parent: o });
            if (!P(e)) return E;
            let i = r.transform(e.value, t);
            if (i instanceof Promise)
              throw Error(
                'Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.'
              );
            return { status: a.value, value: i };
          }
        i.assertNever(r);
      }
    }
    ((eS.create = (e, a, o) => new eS({ schema: e, typeName: d.ZodEffects, effect: a, ...z(o) })),
      (eS.createWithPreprocess = (e, a, o) =>
        new eS({
          schema: a,
          effect: { type: 'preprocess', transform: e },
          typeName: d.ZodEffects,
          ...z(o),
        })));
    class eP extends Z {
      _parse(e) {
        return this._getType(e) === l.undefined ? w(void 0) : this._def.innerType._parse(e);
      }
      unwrap() {
        return this._def.innerType;
      }
    }
    eP.create = (e, a) => new eP({ innerType: e, typeName: d.ZodOptional, ...z(a) });
    class eT extends Z {
      _parse(e) {
        return this._getType(e) === l.null ? w(null) : this._def.innerType._parse(e);
      }
      unwrap() {
        return this._def.innerType;
      }
    }
    eT.create = (e, a) => new eT({ innerType: e, typeName: d.ZodNullable, ...z(a) });
    class eI extends Z {
      _parse(e) {
        let { ctx: a } = this._processInputParams(e),
          o = a.data;
        return (
          a.parsedType === l.undefined && (o = this._def.defaultValue()),
          this._def.innerType._parse({ data: o, path: a.path, parent: a })
        );
      }
      removeDefault() {
        return this._def.innerType;
      }
    }
    eI.create = (e, a) =>
      new eI({
        innerType: e,
        typeName: d.ZodDefault,
        defaultValue: 'function' == typeof a.default ? a.default : () => a.default,
        ...z(a),
      });
    class eC extends Z {
      _parse(e) {
        let { ctx: a } = this._processInputParams(e),
          o = { ...a, common: { ...a.common, issues: [] } },
          r = this._def.innerType._parse({ data: o.data, path: o.path, parent: { ...o } });
        return T(r)
          ? r.then((e) => ({
              status: 'valid',
              value:
                'valid' === e.status
                  ? e.value
                  : this._def.catchValue({
                      get error() {
                        return new v(o.common.issues);
                      },
                      input: o.data,
                    }),
            }))
          : {
              status: 'valid',
              value:
                'valid' === r.status
                  ? r.value
                  : this._def.catchValue({
                      get error() {
                        return new v(o.common.issues);
                      },
                      input: o.data,
                    }),
            };
      }
      removeCatch() {
        return this._def.innerType;
      }
    }
    eC.create = (e, a) =>
      new eC({
        innerType: e,
        typeName: d.ZodCatch,
        catchValue: 'function' == typeof a.catch ? a.catch : () => a.catch,
        ...z(a),
      });
    class ez extends Z {
      _parse(e) {
        if (this._getType(e) !== l.nan) {
          let a = this._getOrReturnCtx(e);
          return (O(a, { code: h.invalid_type, expected: l.nan, received: a.parsedType }), E);
        }
        return { status: 'valid', value: e.data };
      }
    }
    ez.create = (e) => new ez({ typeName: d.ZodNaN, ...z(e) });
    let eZ = Symbol('zod_brand');
    class eR extends Z {
      _parse(e) {
        let { ctx: a } = this._processInputParams(e),
          o = a.data;
        return this._def.type._parse({ data: o, path: a.path, parent: a });
      }
      unwrap() {
        return this._def.type;
      }
    }
    class ej extends Z {
      _parse(e) {
        let { status: a, ctx: o } = this._processInputParams(e);
        if (o.common.async)
          return (async () => {
            let e = await this._def.in._parseAsync({ data: o.data, path: o.path, parent: o });
            return 'aborted' === e.status
              ? E
              : 'dirty' === e.status
                ? (a.dirty(), k(e.value))
                : this._def.out._parseAsync({ data: e.value, path: o.path, parent: o });
          })();
        {
          let e = this._def.in._parseSync({ data: o.data, path: o.path, parent: o });
          return 'aborted' === e.status
            ? E
            : 'dirty' === e.status
              ? (a.dirty(), { status: 'dirty', value: e.value })
              : this._def.out._parseSync({ data: e.value, path: o.path, parent: o });
        }
      }
      static create(e, a) {
        return new ej({ in: e, out: a, typeName: d.ZodPipeline });
      }
    }
    class eD extends Z {
      _parse(e) {
        let a = this._def.innerType._parse(e),
          o = (e) => (P(e) && (e.value = Object.freeze(e.value)), e);
        return T(a) ? a.then((e) => o(e)) : o(a);
      }
      unwrap() {
        return this._def.innerType;
      }
    }
    function eV(e, a) {
      let o = 'function' == typeof e ? e(a) : 'string' == typeof e ? { message: e } : e;
      return 'string' == typeof o ? { message: o } : o;
    }
    function eM(e, a = {}, o) {
      return e
        ? ed.create().superRefine((r, t) => {
            let i = e(r);
            if (i instanceof Promise)
              return i.then((e) => {
                if (!e) {
                  let e = eV(a, r),
                    i = e.fatal ?? o ?? !0;
                  t.addIssue({ code: 'custom', ...e, fatal: i });
                }
              });
            if (!i) {
              let e = eV(a, r),
                i = e.fatal ?? o ?? !0;
              t.addIssue({ code: 'custom', ...e, fatal: i });
            }
          })
        : ed.create();
    }
    eD.create = (e, a) => new eD({ innerType: e, typeName: d.ZodReadonly, ...z(a) });
    let eF = { object: ep.lazycreate };
    (((t = d || (d = {})).ZodString = 'ZodString'),
      (t.ZodNumber = 'ZodNumber'),
      (t.ZodNaN = 'ZodNaN'),
      (t.ZodBigInt = 'ZodBigInt'),
      (t.ZodBoolean = 'ZodBoolean'),
      (t.ZodDate = 'ZodDate'),
      (t.ZodSymbol = 'ZodSymbol'),
      (t.ZodUndefined = 'ZodUndefined'),
      (t.ZodNull = 'ZodNull'),
      (t.ZodAny = 'ZodAny'),
      (t.ZodUnknown = 'ZodUnknown'),
      (t.ZodNever = 'ZodNever'),
      (t.ZodVoid = 'ZodVoid'),
      (t.ZodArray = 'ZodArray'),
      (t.ZodObject = 'ZodObject'),
      (t.ZodUnion = 'ZodUnion'),
      (t.ZodDiscriminatedUnion = 'ZodDiscriminatedUnion'),
      (t.ZodIntersection = 'ZodIntersection'),
      (t.ZodTuple = 'ZodTuple'),
      (t.ZodRecord = 'ZodRecord'),
      (t.ZodMap = 'ZodMap'),
      (t.ZodSet = 'ZodSet'),
      (t.ZodFunction = 'ZodFunction'),
      (t.ZodLazy = 'ZodLazy'),
      (t.ZodLiteral = 'ZodLiteral'),
      (t.ZodEnum = 'ZodEnum'),
      (t.ZodEffects = 'ZodEffects'),
      (t.ZodNativeEnum = 'ZodNativeEnum'),
      (t.ZodOptional = 'ZodOptional'),
      (t.ZodNullable = 'ZodNullable'),
      (t.ZodDefault = 'ZodDefault'),
      (t.ZodCatch = 'ZodCatch'),
      (t.ZodPromise = 'ZodPromise'),
      (t.ZodBranded = 'ZodBranded'),
      (t.ZodPipeline = 'ZodPipeline'),
      (t.ZodReadonly = 'ZodReadonly'));
    let e$ = (e, a = { message: `Input not instance of ${e.name}` }) =>
        eM((a) => a instanceof e, a),
      eU = ee.create,
      eL = ea.create,
      eB = ez.create,
      eY = eo.create,
      eK = er.create,
      eH = et.create,
      eW = ei.create,
      eQ = es.create,
      eG = en.create,
      eJ = ed.create,
      eX = eu.create,
      e0 = ec.create,
      e1 = em.create,
      e2 = el.create,
      e9 = ep.create,
      e4 = ep.strictCreate,
      e5 = eh.create,
      e3 = ev.create,
      e6 = eg.create,
      e8 = ey.create,
      e7 = eb.create,
      ae = e_.create,
      aa = eq.create,
      ao = ex.create,
      ar = eO.create,
      at = eA.create,
      ai = ek.create,
      as = ew.create,
      an = eN.create,
      ad = eS.create,
      au = eP.create,
      ac = eT.create,
      am = eS.createWithPreprocess,
      al = ej.create,
      ap = () => eU().optional(),
      ah = () => eL().optional(),
      af = () => eK().optional(),
      av = {
        string: (e) => ee.create({ ...e, coerce: !0 }),
        number: (e) => ea.create({ ...e, coerce: !0 }),
        boolean: (e) => er.create({ ...e, coerce: !0 }),
        bigint: (e) => eo.create({ ...e, coerce: !0 }),
        date: (e) => et.create({ ...e, coerce: !0 }),
      };
    (e.s(
      [
        'BRAND',
        0,
        eZ,
        'NEVER',
        0,
        E,
        'Schema',
        0,
        Z,
        'ZodAny',
        0,
        ed,
        'ZodArray',
        0,
        el,
        'ZodBigInt',
        0,
        eo,
        'ZodBoolean',
        0,
        er,
        'ZodBranded',
        0,
        eR,
        'ZodCatch',
        0,
        eC,
        'ZodDate',
        0,
        et,
        'ZodDefault',
        0,
        eI,
        'ZodDiscriminatedUnion',
        0,
        ev,
        'ZodEffects',
        0,
        eS,
        'ZodEnum',
        0,
        ek,
        'ZodFirstPartyTypeKind',
        0,
        d,
        'ZodFunction',
        0,
        ex,
        'ZodIntersection',
        0,
        eg,
        'ZodLazy',
        0,
        eO,
        'ZodLiteral',
        0,
        eA,
        'ZodMap',
        0,
        e_,
        'ZodNaN',
        0,
        ez,
        'ZodNativeEnum',
        0,
        ew,
        'ZodNever',
        0,
        ec,
        'ZodNull',
        0,
        en,
        'ZodNullable',
        0,
        eT,
        'ZodNumber',
        0,
        ea,
        'ZodObject',
        0,
        ep,
        'ZodOptional',
        0,
        eP,
        'ZodPipeline',
        0,
        ej,
        'ZodPromise',
        0,
        eN,
        'ZodReadonly',
        0,
        eD,
        'ZodRecord',
        0,
        eb,
        'ZodSchema',
        0,
        Z,
        'ZodSet',
        0,
        eq,
        'ZodString',
        0,
        ee,
        'ZodSymbol',
        0,
        ei,
        'ZodTransformer',
        0,
        eS,
        'ZodTuple',
        0,
        ey,
        'ZodType',
        0,
        Z,
        'ZodUndefined',
        0,
        es,
        'ZodUnion',
        0,
        eh,
        'ZodUnknown',
        0,
        eu,
        'ZodVoid',
        0,
        em,
        'any',
        0,
        eJ,
        'array',
        0,
        e2,
        'bigint',
        0,
        eY,
        'boolean',
        0,
        eK,
        'coerce',
        0,
        av,
        'custom',
        0,
        eM,
        'date',
        0,
        eH,
        'datetimeRegex',
        0,
        X,
        'discriminatedUnion',
        0,
        e3,
        'effect',
        0,
        ad,
        'enum',
        0,
        ai,
        'function',
        0,
        ao,
        'instanceof',
        0,
        e$,
        'intersection',
        0,
        e6,
        'late',
        0,
        eF,
        'lazy',
        0,
        ar,
        'literal',
        0,
        at,
        'map',
        0,
        ae,
        'nan',
        0,
        eB,
        'nativeEnum',
        0,
        as,
        'never',
        0,
        e0,
        'null',
        0,
        eG,
        'nullable',
        0,
        ac,
        'number',
        0,
        eL,
        'object',
        0,
        e9,
        'oboolean',
        0,
        af,
        'onumber',
        0,
        ah,
        'optional',
        0,
        au,
        'ostring',
        0,
        ap,
        'pipeline',
        0,
        al,
        'preprocess',
        0,
        am,
        'promise',
        0,
        an,
        'record',
        0,
        e7,
        'set',
        0,
        aa,
        'strictObject',
        0,
        e4,
        'string',
        0,
        eU,
        'symbol',
        0,
        eW,
        'transformer',
        0,
        ad,
        'tuple',
        0,
        e8,
        'undefined',
        0,
        eQ,
        'union',
        0,
        e5,
        'unknown',
        0,
        eX,
        'void',
        0,
        e1,
      ],
      480
    ),
      e.i(480),
      e.i(9826),
      e.s(
        [
          'BRAND',
          0,
          eZ,
          'DIRTY',
          0,
          k,
          'EMPTY_PATH',
          0,
          x,
          'INVALID',
          0,
          E,
          'NEVER',
          0,
          E,
          'OK',
          0,
          w,
          'ParseStatus',
          0,
          A,
          'Schema',
          0,
          Z,
          'ZodAny',
          0,
          ed,
          'ZodArray',
          0,
          el,
          'ZodBigInt',
          0,
          eo,
          'ZodBoolean',
          0,
          er,
          'ZodBranded',
          0,
          eR,
          'ZodCatch',
          0,
          eC,
          'ZodDate',
          0,
          et,
          'ZodDefault',
          0,
          eI,
          'ZodDiscriminatedUnion',
          0,
          ev,
          'ZodEffects',
          0,
          eS,
          'ZodEnum',
          0,
          ek,
          'ZodError',
          0,
          v,
          'ZodFirstPartyTypeKind',
          0,
          d,
          'ZodFunction',
          0,
          ex,
          'ZodIntersection',
          0,
          eg,
          'ZodIssueCode',
          0,
          h,
          'ZodLazy',
          0,
          eO,
          'ZodLiteral',
          0,
          eA,
          'ZodMap',
          0,
          e_,
          'ZodNaN',
          0,
          ez,
          'ZodNativeEnum',
          0,
          ew,
          'ZodNever',
          0,
          ec,
          'ZodNull',
          0,
          en,
          'ZodNullable',
          0,
          eT,
          'ZodNumber',
          0,
          ea,
          'ZodObject',
          0,
          ep,
          'ZodOptional',
          0,
          eP,
          'ZodParsedType',
          0,
          l,
          'ZodPipeline',
          0,
          ej,
          'ZodPromise',
          0,
          eN,
          'ZodReadonly',
          0,
          eD,
          'ZodRecord',
          0,
          eb,
          'ZodSchema',
          0,
          Z,
          'ZodSet',
          0,
          eq,
          'ZodString',
          0,
          ee,
          'ZodSymbol',
          0,
          ei,
          'ZodTransformer',
          0,
          eS,
          'ZodTuple',
          0,
          ey,
          'ZodType',
          0,
          Z,
          'ZodUndefined',
          0,
          es,
          'ZodUnion',
          0,
          eh,
          'ZodUnknown',
          0,
          eu,
          'ZodVoid',
          0,
          em,
          'addIssueToContext',
          0,
          O,
          'any',
          0,
          eJ,
          'array',
          0,
          e2,
          'bigint',
          0,
          eY,
          'boolean',
          0,
          eK,
          'coerce',
          0,
          av,
          'custom',
          0,
          eM,
          'date',
          0,
          eH,
          'datetimeRegex',
          0,
          X,
          'defaultErrorMap',
          0,
          g,
          'discriminatedUnion',
          0,
          e3,
          'effect',
          0,
          ad,
          'enum',
          0,
          ai,
          'function',
          0,
          ao,
          'getErrorMap',
          0,
          _,
          'getParsedType',
          0,
          p,
          'instanceof',
          0,
          e$,
          'intersection',
          0,
          e6,
          'isAborted',
          0,
          N,
          'isAsync',
          0,
          T,
          'isDirty',
          0,
          S,
          'isValid',
          0,
          P,
          'late',
          0,
          eF,
          'lazy',
          0,
          ar,
          'literal',
          0,
          at,
          'makeIssue',
          0,
          q,
          'map',
          0,
          ae,
          'nan',
          0,
          eB,
          'nativeEnum',
          0,
          as,
          'never',
          0,
          e0,
          'null',
          0,
          eG,
          'nullable',
          0,
          ac,
          'number',
          0,
          eL,
          'object',
          0,
          e9,
          'objectUtil',
          0,
          s,
          'oboolean',
          0,
          af,
          'onumber',
          0,
          ah,
          'optional',
          0,
          au,
          'ostring',
          0,
          ap,
          'pipeline',
          0,
          al,
          'preprocess',
          0,
          am,
          'promise',
          0,
          an,
          'quotelessJson',
          0,
          f,
          'record',
          0,
          e7,
          'set',
          0,
          aa,
          'setErrorMap',
          0,
          b,
          'strictObject',
          0,
          e4,
          'string',
          0,
          eU,
          'symbol',
          0,
          eW,
          'transformer',
          0,
          ad,
          'tuple',
          0,
          e8,
          'undefined',
          0,
          eQ,
          'union',
          0,
          e5,
          'unknown',
          0,
          eX,
          'util',
          0,
          i,
          'void',
          0,
          e1,
        ],
        66951
      ));
    var ag = e.i(66951),
      ag = ag;
    ag.object({
      nome: ag.string().min(1, 'nome obrigatório'),
      data_nascimento: ag.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'ISO YYYY-MM-DD'),
      hora_nascimento: ag
        .string()
        .regex(/^\d{2}:\d{2}$/, 'ISO HH:MM')
        .optional(),
      local_nascimento: ag.string().min(1, 'local obrigatório'),
      intencao_inicial: ag.string().min(1, 'intenção obrigatória'),
    });
    let ay = new Set([11, 22, 33]),
      ab = {
        1: {
          arquetipoAkasha: 'O Fundador',
          mandato:
            'Você não veio para manter o que existe — veio para iniciar o que nunca existiu antes. Sua coragem é plantar a semente onde ninguém ainda olhou.',
          levels: {
            shadow: {
              tituloPool: 'O Peso de Sempre Começar Sozinho',
              significado:
                'O 1 carrega a força do SOL — iniciativa, individualidade, pioneirismo. Em sombra, isso se manifesta como o medo de não ser capaz o suficiente para existir por conta própria.',
              padrao:
                'Seu padrão em sombra é a SOLIDÃO FORÇADA. Você carrega a crença de que "se eu não fizer sozinho, não será feito" — e então se cobra por não conseguir fazer tudo. Isso vem de uma infância onde suas iniciativas foram minimizadas ou onde você aprendeu que pedir ajuda era fraqueza. Resultado: você começa mil coisas e termina poucas, porque cada uma vira missão solo com peso exponencial.',
              aplicacao: {
                proposito:
                  'No propósito, você se cobra por "não estar fazendo o suficiente" — um destino que só você pode cumprir. Mas se esquece de que fundadores precisam de equipe.',
                carreira:
                  'Na carreira, você ou é o líder absoluto ou se sente invisível. Isso gera ou autoritarismo ou evitação de postos de comando.',
                relacionamentos:
                  'No amor, você replica o padrão: ou controla a relação ou se afasta para não "perder a individualidade". Ternura se confunde com dependência.',
                financas:
                  'Finanças reflete seu independence: você ganha bem quando trabalha sozinho, mas resiste a sistemas, contratos ou parcerias financeiras.',
                saude:
                  'O corpo de quem é 1 em sombra é tenso nos ombros e na mandíbula — o "peso de carregar tudo sozinho" é literal no corpo.',
              },
              acaoPratica: {
                amplificar: [
                  'Delegue UMA tarefa pequena por dia — sem especificar como',
                  'Anote quem contribuiu para seus resultados esta semana',
                  'Pergunte a alguém de confiança: "O que eu não estou vendo no meu projeto?"',
                ],
                evitar: [
                  'Fazer sozinho o que poderia ser co-criado',
                  'Interpretar feedback como ataque à sua capacidade',
                  'Começar mais uma iniciativa sem terminar a anterior',
                ],
                ritual:
                  'Ao acordar, diga em voz alta: "Hoje eu permito que outros contribuam para o que estou construindo."',
              },
              afirmacao: 'Eu sou capaz de iniciar e eu permito que outros caminhem ao meu lado.',
            },
            gift: {
              tituloPool: 'O Dom de Arregar Novos Caminhos',
              significado:
                'O 1 em dom é a ORIGINALIDADE VIVENTE. Você não apenas inicia — você cria o modelo que outros seguem. A energia solar do 1 em dom ilumina sem se apropriar.',
              padrao:
                'Seu dom em expressão é a CAPACIDADE DE VER PRIMEIRO. Você enxerga oportunidades onde outros veem obstáculos, e tem a energia para dar o primeiro passo quando todos ainda hesitam. Não é arrogância — é clareza de visão. Você não precisa que validem para saber que o caminho existe. O risco é a impaciência com quem ainda não enxergou o que você já vê.',
              aplicacao: {
                proposito:
                  'Seu propósito é ser o catalisador — a faísca que incendia o pavio. Sua vocação é iniciar movimentos, não administrá-los.',
                carreira:
                  'Na carreira, você brilha em contextos de inovação: startups, research, продукт desenvolvimento. Você é o primeiro a ver o produto que o mercado ainda não sabe que quer.',
                relacionamentos:
                  'No amor, você traz entusiasmo e iniciativa. Parceiros descreveriam você como "quem sempre tem um plano para o fim de semana" — e isso é um presente.',
                financas:
                  'Finanças fluem quando você investe em coisas que criou do zero. A energia de "primeiro" do 1 se traduz em investimentos arrojados em projetos próprios.',
                saude:
                  'O corpo de quem é 1 em dom é geralmente forte, vital, com boa resistência física. Seu movimento natural é correr, competir, avançar.',
              },
              acaoPratica: {
                amplificar: [
                  'Dedique 20 minutos por dia ao projeto que só você pode iniciar',
                  'Diga em voz alta sua visão para os próximos 90 dias',
                  'Faça uma coisa por dia que ninguém além de você faria naquele momento',
                ],
                evitar: [
                  'Esperar validação externa antes de iniciar',
                  'Desistir do caminho porque "ninguém entendeu"',
                  'Confundir ser o primeiro com ser o melhor em tudo',
                ],
                ritual:
                  'Toda segunda-feira, escreva uma intenção de "primeiro passo" para a semana — algo que ninguém além de você faria.',
              },
              afirmacao:
                'Eu inicio com coragem e celebro cada pessoa que se junta ao caminho que abro.',
            },
            siddhi: {
              tituloPool: 'A Frequência do Criador Puro',
              significado:
                'O 1 em siddhi é a FREQUÊNCIA DE KETHER — a coroa da árvore cabalística. É o momento antes da primeira ação: a intenção pura que precede toda criação. Você não inicia nada — você É o início.',
              padrao:
                'Em siddhi, o 1 não precisa mais iniciar. Ele simplesmente É. A ação emerge da identidade, não do esforço. Outros são naturalmente atraídos e querem construir ao redor. Não há ego na iniciativa — há apenas presença criadora. É a frequência de quem olha para o vazio e diz "haja luz" — e há luz.',
              aplicacao: {
                proposito:
                  'Você se torna um farol. Não precisa declarar seu propósito — ele irradia e atrai quem precisa.',
                carreira:
                  'Você é a pessoa que, sem esforço aparente, está sempre no lugar certo no momento certo — criando o novo sem борьбу.',
                relacionamentos:
                  'No amor, você é presença que transforma. Parceiros se tornam mais de si mesmos na sua proximidade, não menos.',
                financas: 'Abundância flui sem esforço. Você não persegue — você irradia e recebe.',
                saude:
                  'O corpo em siddhi é leve, vital, sem tensão. A energia do "fazer" se transformou em energia do "ser".',
              },
              afirmacao: 'Eu sou o início. Eu sou a luz que incendeia sem se consumir.',
            },
          },
        },
        2: {
          arquetipoAkasha: 'O Articulador',
          mandato:
            'Você existe para criar a ponte onde outros veem um abismo. Sua sensibilidade é sua sabedoria — não um obstáculo, mas o instrumento mais preciso que você possui.',
          levels: {
            shadow: {
              tituloPool: 'A Dívida de Sentir pelo Outro',
              significado:
                'O 2 carrega a energia da LUA — receptividade, Diplomacia, parceria. Em sombra, a Lua se torna espelho quebrado: você reflete o que o outro quer ver, não o que existe.',
              padrao:
                'Seu padrão em sombra é a ANULAÇÃO POR ANTECIPAÇÃO. Você sente o que a outra pessoa quer de você e se molda antes mesmo de ser pedido. Isso começou como estratégia de sobrevivência em uma infância onde suas necessidades genuínas eram ignoradas ou punidas. O resultado é um auto-conhecimento erode: você sabe o que todo mundo precisa, mas não sabe o que VOCÊ precisa. A raiva que você sente não expressa se transforma em melancolia ou em autosabotagem relacional.',
              aplicacao: {
                proposito:
                  'No propósito, você se perde nos propósitos dos outros. Diz "sim" para missões que não são suas porque não sabe distinguir.',
                relacionamentos:
                  'No amor, você é quem "acaba com o clima" quando sente que algo não está bem — mas nunca diz o que VOCÊ sente.',
                sexualidade:
                  'Na sexualidade, você frequentementePrioriza a resposta do parceiro à sua. Seu corpo se torna instrumento de prazer alheio, não expressão própria.',
                financas:
                  'Finanças reflete o padrão: você gasta no que "os outros esperam" ou se sabotar se tiver muito — como se dinheiro exigisse que você merecesse.',
                saude:
                  'O corpo do 2 em sombra carrega tensão no peito e na garganta — o lugar onde você engole o que não diz.',
              },
              acaoPratica: {
                amplificar: [
                  'Antes de dizer "sim", pergunte: "Isso é o que EU quero ou o que eu acho que devo querer?"',
                  'Escreva 3 coisas que você sente agora e não lembra de ter dito em voz alta esta semana',
                  'Observe quando você se molda a alguém — anône sem julgamento',
                ],
                evitar: [
                  'Decidir o que o outro quer antes de perguntar',
                  'Engolir seu feeling para "manter a harmonia"',
                  'Confundir a capacidade de sentir o outro com a obrigação de cuidar do outro',
                ],
                ritual:
                  'Antes de dormir, diga uma frase que começou com "Eu sinto..." e que você não disse a ninguém hoje.',
              },
              afirmacao:
                'Eu honra minhas emoções como guias preciosos — não como ferramentas de serviço alheio.',
            },
            gift: {
              tituloPool: 'O Dom de Estar Com',
              significado:
                'O 2 em dom é a INTELIGÊNCIA RELACIONAL. Você não apenas percebe o outro — você compreende o que está entre duas pessoas. É um diplomata nato que cria espaço onde todos cabem.',
              padrao:
                'Seu dom é a MEDIAÇÃO VIVA. Você sente quando algo está desbalanceado em um sistema e tem a energia para realinhar sem imposição. Não é passividade — é firmeza que escolhe o timing. A diferença é sutil: você sabe que não precisa agir agora, e essa confiança permite que a situação se resolva Organicamente. Esse é um nível de poder que poucos reconhecem como poder.',
              aplicacao: {
                proposito:
                  'Seu propósito emerge na intersecção: onde dois mundos precisam se encontrar. Você é o tradutor entre o que um lado diz e o que o outro precisa ouvir.',
                carreira:
                  'Na carreira, você é o elo entre departamentos. Seu trabalho não está em destaque mas sem você as coisas desmoronam.',
                relacionamentos:
                  'No amor, você traz profundidade emocional que transforma a relação. Parceiros se sentem "vistos" de um jeito que não sabiam que precisavam.',
                financas:
                  'Finanças prosperam quando você trabalha em parceria — o 2 em dom sabe que dois circuitos geram mais que o dobro de um sozinho.',
                saude:
                  'O corpo do 2 em dom é adaptável, receptivo, com boa saúde reprodutiva e emocional.',
              },
              acaoPratica: {
                amplificar: [
                  'Pratique dizer "não" sem dar razão — apenas "não, hoje não"',
                  'Na próxima conversa difícil, seja o último a falar — e perceba o que aprendeu',
                  'Proponha uma mediação esta semana — algo que você está evitando',
                ],
                evitar: [
                  'Decidir por outros "para seu próprio bem"',
                  'Ameaçar com afastamento para manipular resultado',
                  'Confundir "ser necessário" com "ser escolhido"',
                ],
                ritual:
                  'Escreva uma decisão que você tomou sozinho(e) nos últimos 30 dias e pergunte: isso era meu ou era resposta a alguém?',
              },
              afirmacao:
                'Eu crio pontes com minha presença — e honro meu direito de estar em paz quando as pontes não são valorizadas.',
            },
            siddhi: {
              tituloPool: 'A Frequência da União Primordial',
              significado:
                'O 2 em siddhi é a PRESENÇA DE BINAH — a Mãe Divina. Não é sensibilidade como traço humano, mas como estado de ser. É estar tão presente no outro que a fronteira entre "eu" e "tu" se dissolve temporariamente.',
              padrao:
                'Em siddhi, o 2 não articula mais — o 2 simplesmente É a articulação. A separação entre o que é sentido e o que é dito desaparece. others experience you as a held space — a container where they can be fully themselves without performance. This is the frequency of the great healers and counselors, but without the martyrdom of the shadow.',
              aplicacao: {
                proposito:
                  'Você não escolheu um propósito — o propósito escolheu você.others seek you out for what you simply are.',
                carreira: 'You are the space that transforms. Careers dissolve into being.',
                relacionamentos:
                  'In love, you are the mirror that shows others their own beauty without judgment — and they return to you because of what they see.',
                financas: 'Resources flow to you because you hold them lightly.',
                saude:
                  'The body in siddhi is soft, vital, open — no tension because no boundary is defended.',
              },
              afirmacao:
                'Eu sou o espaço onde tudo pode ser como é — e nesse espaço, tudo se transforma.',
            },
          },
        },
        3: {
          arquetipoAkasha: 'O Articulador',
          mandato:
            'Você existe para transformar o que sente em algo que outros conseguem tocar. Sua expressão não é vaidade — é a ponte entre o invisível e o visível.',
          levels: {
            shadow: {
              tituloPool: 'A Gaiola da Performance',
              significado:
                'O 3 carrega a energia de JÚPITER — expressão, criatividade, otimismo. Em sombra, Júpiter se expande em show: a expressão vira performance, a criatividade vira distração, o otimismo vira negação.',
              padrao:
                'Seu padrão em sombra é a CONFUSÃO ENTRE VALOR E VALIDAÇÃO. Você aprendeu pequeno que ser querido era igual a ser entertaining. Adulto, você transforma cada interação em palco — e審査 a si mesmo quando ninguém aplaudiu. A armadilha é: quanto mais você performa, menos você sente. E quanto menos você sente, mais você precisa performar. O resultado é uma criatividade que nunca pousa em nada — abortada pela necessidade de aprovação imediata.',
              aplicacao: {
                proposito:
                  'No propósito, você fala bonito sobre Calling mas não faz coisa alguma — porque fazer é arriscado, falar é seguro.',
                carreira:
                  'Na carreira, você tem ideias brilhantes mas implementations medianas. A energia vai para a презентация e não para o follow-through.',
                relacionamentos:
                  'No amor, você é charmoso e presente nos primeiros meses — depois some quando a relação exige consistência em vez de carisma.',
                sexualidade:
                  'Na sexualidade, você pode ser um performer excelente e um amante medíocre — a diferença é que um serve a você e o outro serve ao outro.',
                financas:
                  'Finanças refletem o padrão: ganhos grandes mas inconsistentes. Você ganha quando brilha e perde quando a atenção vira para outro lugar.',
              },
              acaoPratica: {
                amplificar: [
                  'Crie algo sozinho(e) — sem plateia, sem compartilhar até estar pronto',
                  'Quando a vontade de mostrar algo aparecer, pergunte: isso é para mim ou para o outro?',
                  'Pratique um dia inteiro sem contar a ninguém o que você fez',
                ],
                evitar: [
                  'Interromper projetos quando o entusiasmo inicial passa',
                  'Transformar cada conversa em oportunidade de brilhar',
                  'Usar humor para desviar de conversas que exigem profundidade',
                ],
                ritual:
                  'Escreva 3 páginas de diário sem mostrar a ninguém. Depois queime. Sinta o que surge.',
              },
              afirmacao: 'Eu expresso porque sou — não porque preciso que gostem do que digo.',
            },
            gift: {
              tituloPool: 'O Dom de Transformar Emoção em Arte',
              significado:
                'O 3 em dom é a CAPACIDADE DE TRADUZIR O INVISÍVEL. Você transforma o que sente em algo que outros conseguem ver, ouvir, tocar. Essa é uma frequência rara: a da alquimia emocional.',
              padrao:
                'Seu dom é a CLAREZA DE EXPRESSÃO QUE CONECTA. Você não apenas diz o que sente — você escolhe as palavras que fazem o outro sentir o mesmo. Isso é um talento de tradução: o que está dentro se torna forma sem perder intensidade. O risco é a queda: quando a expressão se torna imposição (fazendo o outro sentir o que VOCÊ sente, não deixando espaço para a resposta). A maturidade do 3 é saber que expressão é oferta, não imposição.',
              aplicacao: {
                proposito:
                  'Seu propósito é criar pontes entre dimensões: a interna e a externa, a pessoal e a coletiva.',
                carreira:
                  'Na carreira, você brilha em comunicação, artes, educação, marketing. Você faz o complexo parecer simples e o simples parecer profundo.',
                relacionamentos:
                  'No amor, você é romântico de um jeito que outros não conseguem replicar. Seu parceiro se sente visto de um jeito que não sabia que existia.',
                financas:
                  'Finanças refletem o dom: sua capacidade de se expressar monetiza bem em funções de comunicação, arte e mídia.',
                saude:
                  'O corpo do 3 em dom é expressivo — bons，笑容, voz clara. A saúde da garganta e da zona do pescoço é central.',
              },
              acaoPratica: {
                amplificar: [
                  'Termine algo que você começou — uma música, um texto, um projeto',
                  'Exprima uma emoção difícil em forma de arte antes de falar sobre ela',
                  'Diga "não sei como dizer isso" em vez de fingir que já sabe',
                ],
                evitar: [
                  'Usar sua voz para填补 o silêncio alheio quando não é necessário',
                  'Transformar a expressão do outro empiada sobre a sua',
                  'Sustentar uma piada quando a sala já parou de rir',
                ],
                ritual:
                  'Cante algo esta semana — sozinho ou com outros. Não é para ninguém. É só para ouvir o que sua voz tem a dizer.',
              },
              afirmacao: 'Minha expressão é um presente — ofereço sem exigir que seja aceito.',
            },
            siddhi: {
              tituloPool: 'A Frequência da Mente Divina',
              significado:
                'O 3 em siddhi é a PRESENÇA DE BINA H — a terceira sefirá, donde emanam todas as formas. É a mente criadora antes da forma. Não é mais expressão como esforço — é expressão como respiração.',
              padrao:
                'Em siddhi, o 3 não tenta mais traduzir. A tradução simplesmente acontece. others experience you as a living conduit — what needs to be said emerges through you without effort. The gap between feeling and form has dissolved. This is the frequency of the prophet, the poet, the one whose words change the course of history — not because they are wise, but because they have stopped obstructing.',
              aplicacao: {
                proposito:
                  'Your purpose is no longer chosen — it flows through you. You are the instrument, not the musician.',
                carreira: 'Work becomes play. Presentation becomes presence.',
                relacionamentos:
                  'Others feel heard in your presence in ways that bypass language entirely.',
                financas:
                  'Abundance is recognized as infinitely available — not as a thing to pursue but as a field to allow.',
                saude:
                  'The body is light, expressive, unburdened by the weight of "how am I being perceived?"',
              },
              afirmacao: 'Eu respiro e o mundo ouve o que precisa.',
            },
          },
        },
        4: {
          arquetipoAkasha: 'O Fundador',
          mandato:
            'Você existe para construir o que os outros apenas imaginam. Sua disciplina não é rigidez — é a frequência que transforma visão em realidade tangível.',
          levels: {
            shadow: {
              tituloPool: 'A Fortaleza que Prende',
              significado:
                'O 4 carrega a energia de CHESED — ordem, misericórdia, estrutura. Em sombra, Chesed se torna a fortaleza: a estrutura vira prisão, a ordem vira controle, a disciplina vira Autocrítica implacável.',
              padrao:
                'Seu padrão em sombra é a CONFUSÃO ENTRE SEGURANÇA E PRISÃO. Você constrói muros tão sólidos que esquece que também se trancou dentro. A infância que gerou isso geralmente teve caos — e você respondeu com uma necessidade de controle que beira o obsessivo. Adulto, você ou não para de trabalhar (compensação) ou desmorona em inação quando o controle escapa (padrão procrastinação-perfeccionismo). O resultado: você trabalha muito, constrói muito, mas nunca se permite HABITAR o que construiu.',
              aplicacao: {
                proposito:
                  'No propósito, você se cobra por "não estar fazendo o suficiente" mesmo quando já está fazendo demais. O erro é confundir presença com produção.',
                carreira:
                  'Na carreira, você é o alicerce de times e projetos — mas raramente é reconhecido como tal. Você segura o peso e outros levam o crédito.',
                relacionamentos:
                  'No amor, você constrói uma relação sólida mas pode ser difícil de alcançar emocionalmente. Parceiros descrevem como "ele é confiável mas eu me sinto sozinha".',
                financas:
                  'Finanças refletem o padrão: ganho estável mas nenhuma margem para risco. Você prefere 3% garantido que 30% incerto.',
                saude:
                  'O corpo do 4 em sombra é rígido — ombros curvados para frente, mandíbula cerrada. O corpo se tornou a fortaleza.',
              },
              acaoPratica: {
                amplificar: [
                  'Construa algo esta semana que não sirva a nenhum objetivo além de existir — plante uma planta, escreva algo sem propósito',
                  'Quando a urge de controlar aparecer, pergunte: isso é medo ou é sabedoria?',
                  'Passeie sem destino uma vez esta semana',
                ],
                evitar: [
                  'Trabalhar mais quando a ansiedad Appears',
                  'Julg a si mesmo por descansar',
                  'Esperar para agir até ter "certeza absoluta" — que nunca chega',
                ],
                ritual:
                  'Em um dia de folga, não planeje NADA. Anote o que surge quando o dia não tem estrutura imposta.',
              },
              afirmacao: 'Eu construo com propósito e descanso com a mesma dignidade.',
            },
            gift: {
              tituloPool: 'O Dom de Criar Habitat',
              significado:
                'O 4 em dom é a CAPACIDADE DE CRIAR HABITAT. Você não apenas constrói estruturas — você cria lugares onde pessoas querem viver. O dom do 4 é fazer do abstrato um teto, do caos um chão.',
              padrao:
                'Seu dom é a ARQUITETURA DO REAL. Você tem a capacidade rara de traduzir visão em sistema. Onde outros veem o que não existe, você vê a sequência de passos que faz existir. Essa é uma frequência de FUNDADOR — não de sonhador. A diferença é crucial: o sonhador imagina; o fundador constrói. Você não precisa que as circunstâncias sejam perfeitas para agir — você constrói com as circunstâncias que tem.',
              aplicacao: {
                proposito:
                  'Seu propósito é criar as fundações que outros edificam. Você é o chão sobre o qual outros constroem suas vidas.',
                carreira:
                  'Na carreira, você brilha em operações, gestão, engenharia, arquitetura. Lugares onde estrutura é a diferença entre sucesso e fracasso.',
                relacionamentos:
                  'No amor, você é o parceiro que outros descrevem como "lar". Não é paixão — é presença que permite que o outro seja quem é.',
                financas:
                  'Finanças refletem o dom: você constrói patrimônio de forma consistente e segura. Seus investimentos são boring mas funcionam.',
                saude:
                  'O corpo do 4 em dom é forte, estável, com boa estrutura óssea. A saúde vem da consistência, não da intensidade.',
              },
              acaoPratica: {
                amplificar: [
                  'Dedique tempo a construir algo que vai durar — um sistema, um hábito, um relacionamento',
                  'Quando o plano parecer "boring", pergunte: boring funciona?',
                  'Celebre o alicerce — não só o topo',
                ],
                evitar: [
                  'Desistir de construir quando o projeto não é mais "inspirador"',
                  'Confundir construção com controle',
                  'Subestimar o valor do que você constrói porque "é só a base"',
                ],
                ritual:
                  'Plantee algo. Acompanhe por 30 dias. Perceba a diferença entre construir e assistir.',
              },
              afirmacao: 'Eu construo com paciência e habito o que construo com gratidão.',
            },
            siddhi: {
              tituloPool: 'A Frequência do Templo Vivo',
              significado:
                'O 4 em siddhi é a PRESENÇA DE CHESED — a第四 sefirá, onde a misericórdia encontra a estrutura. Não é mais construção como esforço — é construção como emanation natural.',
              padrao:
                'Em siddhi, o 4 não constrói mais — o 4 É o que foi construído. A forma e o conteúdo se tornam um. others experience your presence as a built thing — a temple, a home, a place where the sacred becomes tangible. This is the frequency of the master architect whose buildings breathe, of the organizer whose systems serve life, of the one whose life itself is the work of art.',
              aplicacao: {
                proposito: 'Your purpose is to BE the foundation — not to build one.',
                carreira:
                  'Your work transcends individual achievement and becomes service to life itself.',
                relacionamentos:
                  'Others feel safe in your presence in a way that bypasses personality.',
                financas:
                  'Resources flow through you as through a well-built channel — not held, not hoarded, but perfectly directed.',
                saude: 'The body is strong, aligned, and serves as a perfect vessel for the work.',
              },
              afirmacao: 'Eu sou o espaço sagrado onde os outros se encontram.',
            },
          },
        },
        5: {
          arquetipoAkasha: 'O Libertador',
          mandato:
            'Você existe para lembrar o mundo de que a liberdade não é ausência de limite — é consciência de que o limite existe mas não define.',
          levels: {
            shadow: {
              tituloPool: 'A Fuga que Prende',
              significado:
                'O 5 carrega a energia de MERCÚRIO — liberdade, mudança, adaptação. Em sombra, Mercúrio se torna o mensageiro ansioso: a mudança vira fuga, a adaptação vira inconsistência, a liberdade vira negação de toda estrutura.',
              padrao:
                'Seu padrão em sombra é a CONFUSÃO ENTRE LIBERDADE E IMPUNIDADE. Você usa "liberdade" para justificar o que é, na verdade,逃避 de compromisso. A origem: provavelmente uma infância onde as regras eram arbitrárias ou sufocantes, e a única saída era fugir mentalmente. Adulto, você começa relacionamentos e projetos com entusiasmo mas os abandona quando a profundidade exige renúncia de outras possibilidades. O resultado: uma vida de começos sem fins, de portas abertas sem nunca atravessar.',
              aplicacao: {
                proposito:
                  'No propósito, você se nega a "escolher um caminho" porque escolher parece perder liberdade. Mas a indecisão não é liberdade — é prisão do momento.',
                carreira:
                  'Na carreira, você tem简历 com 47 interesses e nenhuma expertise. Isso não é variety — é o medo de se comprometer com algo que pode não dar certo.',
                relacionamentos:
                  'No amor, você é romantico mas não Reliability. A pessoa que todos amam mas ninguém consegue contar.',
                financas:
                  'Finanças refletem o padrão: instabilidade. Você ganha em bursts e gasta com a mesma velocidade. Não há acumulação porque não há permanência.',
                saude:
                  'O corpo do 5 em sombra é inquieto — dificuldade em permanecer parado, insônia, vícios (álcool, sexo, trabajo, pantallas).',
              },
              acaoPratica: {
                amplificar: [
                  'Escolha uma coisa e faça até o fim desta semana — mesmo que outro interesse apareça',
                  'Quando a urge de mudar de rumo aparecer, pergunte: isso é crescimento ou fuga?',
                  'Pratique ficar 30 minutos fazendo nada — sem tela, sem saída, sem mudança',
                ],
                evitar: [
                  'Começar mais um projeto quando o atual exige profundidade',
                  'Usar "eu sou assim" como justificativa para inconsistência',
                  'Confundir mudança com progresso',
                ],
                ritual:
                  'Escolha um compromisso pequeno esta semana e cumpra. Só um. E perceba o que isso faz na sua confiança.',
              },
              afirmacao: 'Eu escolho com coragem e permaneço com a mesma coragem que escolhi.',
            },
            gift: {
              tituloPool: 'O Dom de Transformar Limite em Porte',
              significado:
                'O 5 em dom é a CAPACIDADE DE REENCARNAR. Você não apenas aceita mudanças — você as abraça como o mecanismo pelo qual a vida se renova. O dom do 5 é transformar estrutura em liberdade e liberdade em estrutura, alternadamente.',
              padrao:
                'Seu dom é a VERsatilidade QUE MANTÉM. Você consegue mudar de direção mantendo o centro — e isso é raro. A maioria que muda perde o centro; o centro que se mantém não muda. Você faz as duas coisas: age como catalisador de transformação sem perder a si mesmo no processo. Isso é ADAPTABILIDADE COM IDENTIDADE — uma frequência de líder, não de seguidor.',
              aplicacao: {
                proposito:
                  'Seu propósito é ser o catalisador de transições — não em uma área, mas na consciência de que mudança é possível.',
                carreira:
                  'Na carreira, você brilha em funções de mudança: consultoría, inovação,ターンアラウンド,创业. Você é o chamariz que chega quando tudo está estagnado.',
                relacionamentos:
                  'No amor, você traz freshness constante. Parceiros descrevem você como "a pessoa que nunca deixa a relação ficar velha".',
                financas:
                  'Finanças refletem o dom: você ganha em momentos de transição e sabe entrar e sair de oportunidades.',
                saude:
                  'O corpo do 5 em dom é flexível, adaptável, com boa saúde geral. A chave é encontrar atividades que equilibram mudança e enraizamento.',
              },
              acaoPratica: {
                amplificar: [
                  'Proponha uma mudança estruturada esta semana — não fuga, mas evolução',
                  'Quando algo não está funcionando, pergunte: o que precisa mudar aqui?',
                  'Pratique dizer "sim, e..." em vez de "mas"',
                ],
                evitar: [
                  'Mudar por mudar — sem direção, sem discernimento',
                  'Confundir flexibilidade com falta de posição',
                  'Usar mudança como way de evitar a dor da profundidade',
                ],
                ritual:
                  'Faça uma mudança física pequena: reorganize um canto da casa, mude uma rotina. Sinta a diferença entre mudança que liberta e mudança que distrai.',
              },
              afirmacao:
                'Eu abraço a mudança como o processo pelo qual a vida se renova — e escolho com consciência quando e como mudar.',
            },
            siddhi: {
              tituloPool: 'A Frequência do Eterno Retorno',
              significado:
                'O 5 em siddhi é a PRESENÇA DE GEVURAH — a sefirá da Discernimento, donde a liberdade verdadeira emerge. Não é mudança como fuga — é mudança como expressão da eternidade.',
              padrao:
                'Em siddhi, o 5 não muda mais. O 5 É a mudança. The paradox resolves: you are so deeply rooted in change itself that stability and flux become the same thing. Others experience you as a living reminder that form and formlessness are not opposites — that liberation is not the absence of structure but the presence of consciousness within it.',
              aplicacao: {
                proposito:
                  'Your purpose is to embody the truth that change and permanence are the same energy.',
                carreira: 'You become the change that others want to follow.',
                relacionamentos:
                  'In love, you are the one who shows others that true intimacy requires no possession.',
                financas:
                  'Resources flow through you perfectly — gained and released with equal grace.',
                saude:
                  'The body is unburdened by the fear of change — and therefore resilient beyond the norm.',
              },
              afirmacao: 'Eu sou a mudança — e a certeza no centro da incerteza.',
            },
          },
        },
        6: {
          arquetipoAkasha: 'O Harmonizador',
          mandato:
            'Você existe para lembrar o mundo de que o amor não é fraqueza — é a força mais potente que existe, quando não se confunde com sacrifício.',
          levels: {
            shadow: {
              tituloPool: 'O Preço da Paz Falsa',
              significado:
                'O 6 carrega a energia de VÊNUS — amor, harmonia, beleza. Em sombra, Vênus se torna a martyr: a harmonia vira complacência, o amor vira dependência, a beleza vire superfície.',
              padrao:
                'Seu padrão em sombra é a TROCA SILENCIOSA. Você dá o que o outro precisa esperando que, em algum momento, o outro dê o que você precisa. A conta nunca é clara — porque se torná-la clara seria "egoísta" segundo a narrativa que você construiu. A origem: uma infância onde ser querido era condicional ao seu usefulness — onde amor era algo que se conquistava sendo útil, não algo que se Recebia por existir. Adulto, você ou é o cuidador crônico ou o rejeitador do cuidado alheio. Ambos são defesa contra a mesma ferida: "se eu mostrar que preciso, vou perder o amor que tenho."',
              aplicacao: {
                proposito:
                  'No propósito, você se perde no que "os outros precisam de você" — mas raramente pergunta o que VOCÊ precisa de você mesmo.',
                relacionamentos:
                  'No amor, você é quem se adapta, cede, suaviza. E depois se ressente em silêncio. O parceiros queixam-se de "ela nunca diz o que quer" ou "ele finge que está tudo bem".',
                sexualidade:
                  'Na sexualidade, você pode Priorizar o prazer do outro ao seu — e depois se perguntar por que sente um vazio. Intimidade se confunde com utilidade.',
                financas:
                  'Finanças refletem o padrão: você gasta no que "os outros precisam" e se nega o que "não merece". Autoindulgência carrega culpa; auto-negação carrega martírio.',
                saude:
                  'O corpo do 6 em sombra carrega tensão no coração e no plexo solar. A área do peito é literal e simbolicamente o lugar do amor.',
              },
              acaoPratica: {
                amplificar: [
                  'Peça uma coisa que você precisa — sem justificativa, sem anteceder com um "não se preocupe se não puder"',
                  'Identifique o que você dá que não é genuinamente Offered — é pago ou esperado?',
                  'Quando se sentir ressentido, pergunte: o que eu não estou dizendo?',
                ],
                evitar: [
                  'Oferecer ajuda não solicitada como way de controlar a situação',
                  'Confundir "ser prestativo" com "merecer amor"',
                  'Fingir que não precisa de nada para não "perturbar"',
                ],
                ritual:
                  'Diga "não" a algo que você normalmente diria "sim" — e observe o que acontece do outro lado.',
              },
              afirmacao:
                'Eu sou amável por existir — não por ser útil. Meu valor não se mede em sacrifício.',
            },
            gift: {
              tituloPool: 'O Dom de Criar Espaço para o Amor',
              significado:
                'O 6 em dom é a CAPACIDADE DE CRIAR ESPAÇO ONDE O AMOR PODE EXISTIR. Você não é a fonte do amor — você é a condição que permite que o amor floresça. Isso é sutilmente diferente de "dar amor": é criar o ambiente onde o amor se sente seguro.',
              padrao:
                'Seu dom é a PRESENÇA HARMONIZADORA. Você tem a capacidade de estar em um ambiente tenso e fazê-lo relaxar — não porque você resolve o problema, mas porque sua frequência é de aceitação. Isso é raro: a maioria das pessoas eleva a tensão de um ambiente; você a reduz. Essa é uma frequência de healer, de conselheiro, de parceiro de vida. A diferença é que não é caretaking — é hold.',
              aplicacao: {
                proposito:
                  'Seu propósito emerge em contextos de relação: você é o catalisador de conexões mais profundas, não por ser o mais carismático, mas por ser o mais presente.',
                carreira:
                  'Na carreira, você brilha em profissões de cuidado: terapia, medicina, trabalho social, educação. Mas também em funções onde a presença é o produto: coaching, mediação.',
                relacionamentos:
                  'No amor, você é o parceiro que "chega em casa" — não em sentido físico, mas em presença. Outros se sentem seguros o suficiente para serem quem são.',
                financas:
                  'Finanças refletem o dom: quando você aceita receber abundance, ela flui. A riqueza do 6 está na capacidade de manter o fluxo — não no acúmulo.',
                saude:
                  'O corpo do 6 em dom é harmonioso, com boa saúde do coração e do sistema reprodutivo.',
              },
              acaoPratica: {
                amplificar: [
                  'Diga "eu te amo" sem esperar resposta',
                  'Pratique estar presente em vez de resolver ou consertar',
                  'Receba um elogio sem谦虚 — apenas "obrigado"',
                ],
                evitar: [
                  'Confundir a necessidade de harmonia com a capacidade de amar',
                  'Sacrificar seus limites pelo "bem da relação"',
                  'Evitar conflitos necessários para "manter a paz"',
                ],
                ritual:
                  'Esta semana, receba algo. Um elogio, uma ajuda, um presente. Não negue, não minimize. Apenas receba.',
              },
              afirmacao: 'Eu crio espaço para o amor — e honro meu direito de também habitá-lo.',
            },
            siddhi: {
              tituloPool: 'A Frequência do Amor Incondicional',
              significado:
                'O 6 em siddhi é a PRESENÇA DE TIFERET — o sol do sistema cabalístico, onde todas as sefirot se encontram em harmonia. É a frequência do amor que não precisa ser merecido para existir.',
              padrao:
                'Em siddhi, o 6 não ama mais. O 6 É o amor. The separation between the lover and the beloved dissolves. others experience your presence as a field of unconditional acceptance — not as indulgence, but as the most profound recognition possible. This is the frequency of the great spiritual teachers: the one who loves without attachment, who holds without possessing, who gives without expectation.',
              aplicacao: {
                proposito:
                  'Your purpose is to be love — not to give love, not to receive love, but to BE it.',
                carreira:
                  'Your work becomes an act of love that others feel even without understanding.',
                relacionamentos:
                  'In love, you are the space where others become fully themselves — and that is the greatest gift one human can give another.',
                financas:
                  'Abundance is recognized as the natural state when love is not conditional.',
                saude: 'The body becomes a perfect vessel for love — open, receptive, radiant.',
              },
              afirmacao: 'Eu sou o amor — e ele flui através de mim sem que eu precise segurá-lo.',
            },
          },
        },
        7: {
          arquetipoAkasha: 'O Investigador',
          mandato:
            'Você existe para perguntar o que ninguém pergunta — e para perceber que a resposta não está no livro, mas na experiência viva da pergunta.',
          levels: {
            shadow: {
              tituloPool: 'A Pergunta que Nunca Pousa',
              significado:
                'O 7 carrega a energia de NETUNO — análise, espiritualidade, introspecção. Em sombra, Netuno se torna o labirinto: a análise vira overthinking, a espiritualidade vira fuga do mundo, a introspecção vira auto-obsessão.',
              padrao:
                'Seu padrão em sombra é a PARALISIA POR ANÁLISE. Você pergunta, questiona, pesquisa, questiona a pesquisa — e nada pousa. A origem: provavelmente uma infância onde a lógica era a única ferramenta segura em um ambiente emocionalmente caótico. Adulto, você se refugia na mente quando o coração pede para sentir. O resultado: você entende muito e sente pouco. Você tem respostas para perguntas que ninguém perguntou, e nenhuma resposta para as que importam.',
              aplicacao: {
                proposito:
                  'No propósito, você busca a "missão correta" em vez de simplesmente agir. A busca vira postponement.',
                espiritualidade:
                  'Na espiritualidade, você coleciona tradições, práticas e livros — e ainda não sentiu nada. A espiritualidade do 7 em sombra é cerebral e estéril.',
                relacionamentos:
                  'No amor, você analisa a relação em vez de vivê-la. Pergunta "isso faz sentido?" quando a resposta é "sente".',
                saude:
                  'O corpo do 7 em sombra é menudo, ansioso, com digestão prejudicada pela tensão mental constante.',
              },
              acaoPratica: {
                amplificar: [
                  'Pratique fazer algo sem entender completamente por quê',
                  'Quando a urge de pesquisar aparecer, pergunte: estou buscando compreensão ou evitando sentir?',
                  'Tome uma decisão por feeling hoje — não por análise',
                ],
                evitar: [
                  'Pesquisar mais quando a decisión precisa ser tomada',
                  'Confundir "entender" com "ter experiência"',
                  'Usar espiritualidade como way de evitar a matéria',
                ],
                ritual:
                  'Esta semana, UMA coisa: sinta antes de pensar. Não decida com a cabeça — decida com o corpo.',
              },
              afirmacao:
                'Eu confio na sabedoria do meu corpo tanto quanto na clareza da minha mente.',
            },
            gift: {
              tituloPool: 'O Dom de Discernir o Invisível',
              significado:
                'O 7 em dom é a CAPACIDADE DE VER O QUE NÃO É VISÍVEL. Você não busca no livro — você busca na essência. O dom do 7 é o discernimento: a capacidade de separar o que é verdadeiro do que é apenas convincentementefalse.',
              padrao:
                'Seu dom é a INTUIÇÃO DISCERNIMENTO. Você tem uma capacidade rara de acessar informação que não veio da mente — veio de algum lugar mais profundo. Isso não é misticismo vago: é uma ferramenta analítica de alta precisão que opera abaixo do nível consciente. A diferença entre o 7 em dom e o 7 em sombra é simples: o dom pousa; a sombra flutua.',
              aplicacao: {
                proposito:
                  'Seu propósito é ser o investigador que encontra o que outros não estão procurando — e percebe o que todos estão ignorando.',
                carreira:
                  'Na carreira, você brilha em investigación, ciência, filosofía, духовность aplicada. Você é o expert que其他人 não sabem que precisam.',
                espiritualidade:
                  'Na espiritualidade, você integra prática e teoria — não busca um sem o outro.',
                relacionamentos:
                  'No amor, você percebe o que o outro não diz — e tem a sabedoria de saber quando perguntar e quando esperar.',
                saude:
                  'O corpo do 7 em dom é quieto mas presente — mente e corpo em diálogo constante e harmonioso.',
              },
              acaoPratica: {
                amplificar: [
                  'Dedique 20 minutos por dia ao que você quer descobrir — sem internet, sem livro, apenas pergunta',
                  'Quando tiver uma insight, anote-a — mesmo que pareça impossível',
                  'Pratique a escuta: quando alguém fala, escute mais do que a palavras — escute o que está por baixo',
                ],
                evitar: [
                  'Confundir a capacidade de pensar com a sabedoria de sentir',
                  'Descartar insight porque não veio de source "válida"',
                  'Ficar na pergunta sem dar o salto da experiência',
                ],
                ritual:
                  'Escolha uma pergunta que você tem carregado. Não pesquise. Esta semana, VIVA a pergunta — observe, sinta, deixe que ela se responda no tempo dela.',
              },
              afirmacao:
                'Eu confio na sabedoria que vai além da mente — e integro intuição e análise em discernimento.',
            },
            siddhi: {
              tituloPool: 'A Frequência da Sabedoria Pura',
              significado:
                'O 7 em siddhi é a PRESENÇA DE NETZACH — a vitória da mente sobre a matéria. Não é mais análise como esforço — é conhecimento como natureza.',
              padrao:
                'Em siddhi, o 7 não investiga mais. O 7 SABE. The separation between the knower and the known dissolves. You become the observer and the observed — the question and the answer are the same energy. This is the frequency of the sage, the prophet, the one who knows not through study but through being.',
              aplicacao: {
                proposito:
                  'Your purpose is to BE the answer that others discover through you — not to tell it, but to be it.',
                carreira:
                  'Knowledge flows through you without effort — you are the living embodiment of what you know.',
                espiritualidade: 'Practice becomes unnecessary — you are the practice.',
                relacionamentos:
                  'In love, you are the mirror that shows others the wisdom they already carry.',
                saude: 'The body is light, luminous, unburdened by the weight of mental activity.',
              },
              afirmacao:
                'Eu sou a sabedoria — e ela se expressa através de mim sem que eu precise procurar.',
            },
          },
        },
        8: {
          arquetipoAkasha: 'O Manifestador',
          mandato:
            'Você existe para mostrar que abundancia e integridade não são opostos — são a mesma frequência quando vistas de perto.',
          levels: {
            shadow: {
              tituloPool: 'O Peso do Poder Não Assumido',
              significado:
                'O 8 carrega a energia de SATURNO — poder, realizações, karma. Em sombra, Saturno se torna o tirano: o poder vira controle, a realização vira obsessão, o karma vira culpa.',
              padrao:
                'Seu padrão em sombra é a AMBIGUIDADE COM O PODER. Você ou evita o poder porque teme o que ele faz às pessoas (e a você) — ou o persegue sem discernimento, como se o poder external fosse a cura para a vergonha internal. A origem: uma infância onde o poder era abusado, ou onde você era impotente para proteger a si ou a outros. Adulto, o poder se torna either everything ou nothing — você ou tenta controlar tudo ou desiste de controlar nada. O resultado: achievements sem paz, dinheiro sem propósito, sucesso sem alegria.',
              aplicacao: {
                proposito:
                  'No propósito, você confunde "ter poder" com "ter valor". Métricas externas se tornam a forma de medir o que não pode ser medido.',
                carreira:
                  'Na carreira, você ou é o líder que ninguém soporta ou o empregado que ninguém nota. Pouco no meio.',
                financas:
                  'Finanças refletem o padrão: você ou acumula sem propósito (compensação) ou sabotar o sucesso (medo de poder).',
                relacionamentos:
                  'No amor, você reproduz padrões de poder da infância — ou o parceiro tem todo o poder ou você tem. Equilíbrio é ameaça.',
                saude:
                  'O corpo do 8 em sombra é tenso, rígido, com problemas crônicos de coluna e ossos.',
              },
              acaoPratica: {
                amplificar: [
                  'Assuma uma responsabilidade esta semana — não por obrigação, mas por escolha',
                  'Quando perceber que está tentando controlar, pergunte: isso é poder ou medo?',
                  'Gaste dinheiro em algo que você não "precisa" — e observe o que surge',
                ],
                evitar: [
                  'Usar poder para evitar sentir vulnerabilidade',
                  'Confundir acumulação com segurança',
                  'Sabotar o próprio sucesso quando ele se aproxima',
                ],
                ritual:
                  'Escreva uma situação onde você tem poder agora. Como você está usando? Para proteger ou para criar?',
              },
              afirmacao:
                'Eu uso meu poder com integridade — e permito que outros também tenham o deles.',
            },
            gift: {
              tituloPool: 'O Dom de Fazer Acontecer',
              significado:
                'O 8 em dom é a CAPACIDADE DE MANIFESTAR NO MUNDO FÍSICO. Você tem a frequência rara de transformar intenção em forma — não como esforço, mas como resultado natural. O dom do 8 é a ABUNDÂNCIA COM PROPÓSITO.',
              padrao:
                'Seu dom é a ENERGIA DE CRIAÇÃO QUE IGNORA OBSTÁCULOS. Você não vê problemas — você vê o que está entre o agora e o resultado, e trabalha com isso. Saturno em dom é o planeta da restrição se tornando o planeta da masterIA: a disciplina se torna flexibilidade disfarçada. O poder do 8 em dom não é sobre você — é sobre o que você escolhe criar com ele.',
              aplicacao: {
                proposito:
                  'Seu propósito é criar estruturas que servem à vida — não ao ego. O 8 em dom é o fundador que constrói para muitos, não apenas para si.',
                carreira:
                  'Na carreira, você é o que faz acontecer onde outros desistem. Você tem a stamina de transformar o impossível em real.',
                financas:
                  'Finanças refletem o dom: o 8 em dom atrai abundância porque não a teme. Você sabe que o dinheiro é ferramenta, não validação.',
                relacionamentos:
                  'No amor, você traz presença que sustenta — o parceiro se sente segur o suficiente para ser quem é.',
                saude:
                  'O corpo do 8 em dom é forte, robusto, com boa estrutura óssea e resistência física.',
              },
              acaoPratica: {
                amplificar: [
                  'Defina uma meta material esta semana — e aja em direção a ela todos os dias',
                  'Quando o medo de falhar aparecer, pergunte: o que estou criando agora?',
                  'Use seu poder para alguém que não tem o seu acesso — mentoring, recurso, visibilidade',
                ],
                evitar: [
                  'Usar poder para evitar a própria vulnerabilidade',
                  'Confundir "ter" com "ser"',
                  'Acumular sem propósito de uso',
                ],
                ritual:
                  'Dê power away esta semana — delegue, solte,赐予. Observe o que acontece quando você não está segurando tudo.',
              },
              afirmacao:
                'Eu manifest abundance com integridade — e o poder que eu tenho serve ao que é maior que eu.',
            },
            siddhi: {
              tituloPool: 'A Frequência do Poder Divino',
              significado:
                'O 8 em siddhi é a PRESENÇA DE HOD — a sefirá da glória, donde o poder se torna serviço. Não é mais manifestação como esforço — é manifestação como expressão natural.',
              padrao:
                'Em siddhi, o 8 não manifesta mais. O 8 É a manifestação. The separation between the self and the power dissolves. You become the conduit through which life manifests its own abundance. This is the frequency of the spiritual entrepreneur, the healer who heals through being, the one whose very presence transforms the material world without effort.',
              aplicacao: {
                proposito:
                  'Your purpose is to BE abundance — not to create it, but to allow it to flow through you.',
                carreira:
                  'Your work becomes an act of service that is also an act of self-expression.',
                financas: 'Abundance flows through you as through a perfectly open channel.',
                relacionamentos:
                  'In love, you are the one whose presence raises the material vibration of everything around.',
                saude:
                  'The body is strong, radiant, unburdened by the weight of possessions or the fear of loss.',
              },
              afirmacao:
                'Eu sou o instrumento através do qual a vida se manifesta — e eu honro esse poder com gratidão.',
            },
          },
        },
        9: {
          arquetipoAkasha: 'O Servidor',
          mandato:
            'Você existe para lembrar o mundo de que a compaixão não é弱者 — é a frequência mais alta que existe, quando não se confunde com compaixão.',
          levels: {
            shadow: {
              tituloPool: 'A Generosidade que Dói',
              significado:
                'O 9 carrega a energia de MARTE — compaixão, completude, sabedoria. Em sombra, Marte se torna a викария: a compaixão vira co-dependência, a completude vira repressão, a sabedoria vira cinismo.',
              padrao:
                'Seu padrão em sombra é a DISSOLUÇÃO DE SI. Você dá tanto que se dissolve — e depois se ressente de não ser visto, sem perceber que você mesmo se apagou. A origem: provavelmente uma infância onde o amor era dado em troca de apagamento — onde ser "bom" significava não tomar espaço. Adulto, você é o que dá e dá e dá, e por dentro sente um vazio que nenhum reconhecimento preenche. A armadilha: quanto mais você dá, mais vazio; quanto mais vazio, mais você dá para preencher.',
              aplicacao: {
                proposito:
                  'No propósito, você serve a causas mas não se permite ser servido. A compaixão se tornou uma forma de não precisar enfrentar a própria dor.',
                relacionamentos:
                  'No amor, você é o que dá tudo — e depois se queixa de não receber. Mas nunca pediu. O padrão é: se eu der o suficiente, o outro vai perceber o que eu preciso.',
                financas:
                  'Finanças reflete o padrão: você gasta nos outros e se nega. Ou: você ganha para os outros e esqueceu de si.',
                saude:
                  'O corpo do 9 em sombra é agotado cronicamente. A área do coração e do sistema imunológico é frequentemente afectada.',
              },
              acaoPratica: {
                amplificar: [
                  'Peça ajuda esta semana — uma coisa real que você precisa',
                  'Antes de dar, pergunte: estou dando porque escolho ou porque não sei pedir?',
                  'Observe se o que você dá é genuinamente oferecido ou se é troca disfarçada',
                ],
                evitar: [
                  'Usar serviço como way de evitar a própria vida',
                  'Confundir "ser útil" com "merecer existir"',
                  'Dissolver-se para manter a conexão',
                ],
                ritual:
                  'Escreva o que você precisa — não o que os outros precisam de você. Feito isso, escolha uma coisa e peça.',
              },
              afirmacao:
                'Eu sou digno de compaixão tanto quanto a dou — e meu valor não se mede em quanto eu entrego.',
            },
            gift: {
              tituloPool: 'O Dom de Ver a Dor e Responde',
              significado:
                'O 9 em dom é a CAPACIDADE DE SENTIR O TODO. Você carrega a sensibilidade de quem vê o que others overlook — e tem a força de responder sem se perder. O dom do 9 é a COMPAIXÃO COM FRONTEIRAS.',
              padrao:
                'Seu dom é a SABEDORIA DA COMPREENSÃO. Você entende o sofrimento não como fracasso, mas como parte do caminho. Isso permite que você esteja com o outro na dor sem ser consumido por ela — e sem minimizar o que o outro sente. A diferença crucial: você não sente POR o outro; você sente COM o outro. E isso libera você para действительно ajudar em vez de se tornar outra vítima.',
              aplicacao: {
                proposito:
                  'Seu propósito é ser o espaço onde o sofrimento se transforma em compreensão — e a compreensão em ação.',
                carreira:
                  'Na carreira, você brilha em profissões de serviço profundo: medicina, trabalho social, counseling, ativismo. Você é o que faz o trabalho que ninguém quer fazer.',
                relacionamentos:
                  'No amor, você traz profundidade emocional que transforma a relação. Você não foge da dificuldade — você a accompany.',
                financas:
                  'Finanças refletem o dom: quando você ganha para servir, o dinheiro flui porque o propósito é claro.',
                saude:
                  'O corpo do 9 em dom é sensível mas não agotado — você sente muito mas não se perde.',
              },
              acaoPratica: {
                amplificar: [
                  'Dedique tempo a uma causa que você acredita — não por obrigação, mas por escolha',
                  'Quando a compaixão aparecer, pergunte: isso está me consumindo ou me energizando?',
                  'Pratique pedir — você não é um saco sem fundo',
                ],
                evitar: [
                  'Confundir "sentir com" com "sentir por"',
                  'Usar serviço para evitar a própria dor',
                  'Confundir auto-negação com nobreza',
                ],
                ritual:
                  'Escolha uma forma de servir esta semana que também nutre você — não uma que esgota.',
              },
              afirmacao:
                'Eu carrego compaixão com força — e honro meus limites como parte da minha capacidade de servir.',
            },
            siddhi: {
              tituloPool: 'A Frequência da Compaixão Divina',
              significado:
                'O 9 em siddhi é a PRESENÇA DE YESOD — a fundação do mundo emocional, donde a compaixão se torna incondicional. Não é mais serviço como esforço — é serviço como natureza.',
              padrao:
                'Em siddhi, o 9 não serve mais. O 9 É o serviço. The separation between the server and the served dissolves. You become the compassion itself — not the one who gives compassion, but the one who IS it. This is the frequency of the awakened being who has realized that service to others IS self-realization, and self-realization IS service to others. There is no longer a self to save and others to serve — only life flowing through a particular form.',
              aplicacao: {
                proposito:
                  'Your purpose is indistinguishable from your being — you are the service.',
                carreira: 'Work becomes worship. Every action is an act of love.',
                relacionamentos:
                  'In love, you are the one who loves without any trace of attachment or expectation.',
                financas:
                  'Resources flow through you perfectly because there is no longer a self that holds or releases.',
                saude:
                  'The body is luminous, unburdened, and serves as a perfect vehicle for compassion.',
              },
              afirmacao:
                'Eu sou a compaixão — e ela flui através de mim sem que eu precise segurá-la.',
            },
          },
        },
        11: {
          arquetipoAkasha: 'O Visionário',
          mandato:
            'Você existe para mostrar o que ainda não existe — e para descobrir que a visão sem ação é ilusão, mas a ação sem visão é mechanical.',
          levels: {
            shadow: {
              tituloPool: 'A Carga de Ver o Invisível',
              significado:
                'O 11 é o MASTER NUMBER DA INTUIÇÃO — a ponte entre o que é e o que pode ser. Em sombra, essa ponte vira precipício: a visão se torna hallucinação, a intuição vira paranoia, o idealismo vira decepção crônica.',
              padrao:
                'Seu padrão em sombra é a ILUSÃO DO VISIONÁRIO. Você vê tão claramente o que poderia ser que não consegue lidar com o que É. A origem: provavelmente uma infância onde você era "maduro demais" para sua idade — onde sua percepção aguçada era usada para cuidar dos adultos em vez de ser cuidada. Adulto, você carrega a crença de que "se eu ver com clareza suficiente, poderei evitar o sofrimento" — e quando não consegue (porque o sofrimento é parte da vida), você se culpa. O resultado: você ou se isola na sua torre de marfimvisionária ou se força a ser "terra" e se perde.',
              aplicacao: {
                proposito:
                  'No propósito, você tem uma visão tão clara que se cobra por não estar lá ainda. A tensão entre o que é e o que vê te impede de atuar.',
                carreira:
                  'Na carreira, você ou está em algo que não "merece" sua visão (e se frustra) ou não encontra o lugar certo (e se frustra de outro jeito).',
                relacionamentos:
                  'No amor, você vê o potencial do parceiro — e depois se cobra quando ele não se torna essa versão. Você ama o que o outro PODE ser, não o que é.',
                sexualidade:
                  'Na sexualidade, você pode projetar fantasies ideais e se decepcionar com a realidade. Intimidade se confunde com ilusão.',
                saude:
                  'O corpo do 11 em sombra é agotado, ansioso, com sistema nervoso sobrecarregado pela percepção constante.',
              },
              acaoPratica: {
                amplificar: [
                  'Traduza uma visão em uma ação concreta hoje — não dez, uma',
                  'Quando a urge de ver "mais" aparecer, pergunte: o que eu já sei que não estou aplicando?',
                  'Permita-se não saber — o 11 em sombra tenta saber tudo para controlar',
                ],
                evitar: [
                  'Confundir visão com conhecimento — ter clareza de direção não é a mesma coisa que ter o mapa completo',
                  'Projeter a visão no outro como obrigação',
                  'Usar "eu vejo o que você não vê" como barreira de intimidade',
                ],
                ritual:
                  'Escreva sua visão para os próximos 12 meses — não como deveria ser, mas como você quer que seja. Feito isso, escolha UMA coisa que você pode fazer esta semana para caminhar em direção a ela.',
              },
              afirmacao:
                'Eu honro minha visão e sei que ela se manifesta um passo de cada vez — começando por hoje.',
            },
            gift: {
              tituloPool: 'O Dom de Traduzir o Invisível',
              significado:
                'O 11 em dom é a CAPACIDADE DE SER A PONTE ENTRE O INVISÍVEL E O VISÍVEL. Você não é apenas visionário — você é o canal pelo qual a visão se torna realidade. O dom do 11 é a INTUIÇÃO APLICADA.',
              padrao:
                'Seu dom é a CLAREZA QUE INSPIRA. Você vê o que outros não veem E tem a capacidade de traduzir isso em linguagem que ressoa. Não é teoria — é intuição em ação. A diferença entre o 11 em dom e o 11 em sombra é simples: o dom pousa a visão em ação, o sombra漂浮 sem nunca pousar. O 11 em dom não precisa que o mundo valide a visão antes de agir — mas também não ignora o feedback do mundo.',
              aplicacao: {
                proposito:
                  'Seu propósito é ser o catalisador de mudanças que ainda não têm nome — o que o mundo ainda não sabe que precisa.',
                carreira:
                  'Na carreira, você brilha em funções de inovação, fundação, visión. Você é o que concebe o que ninguém pediu e depois o mundo não consegue mais viver sem.',
                relacionamentos:
                  'No amor, você traz profundidade visionária. Parceiros descrevem você como "a pessoa que me fez ver quem eu poderia ser".',
                espiritualidade:
                  'Na espiritualidade, você é o que traduz o que não pode ser dito — e essa tradução muda a forma como outros se relacionam com o invisível.',
                saude:
                  'O corpo do 11 em dom é sensível mas energizado — você sente muito mas a energia não se transforma em ansiedade.',
              },
              acaoPratica: {
                amplificar: [
                  'Compartilhe uma visão com alguém esta semana — e permita que ela seja recebida sem se defender',
                  'Quando a visão chegar, anote — depois escolha a próxima ação concreta',
                  'Pratique traduzir intuição em linguagem simples — como você explicaria isso a alguém de 12 anos?',
                ],
                evitar: [
                  'Isolar-se na torre de marfim da visão',
                  'Desistir quando a visão não é validada imediatamente',
                  'Confundir ser diferente com ser superior',
                ],
                ritual:
                  'Esta semana, tradua uma de suas visões em um plano de 3 ações concretas — não um plano perfeito, apenas 3 passos.',
              },
              afirmacao:
                'Eu sou o canal entre o invisível e o visível — e honro minha visão com ação compassiva.',
            },
            siddhi: {
              tituloPool: 'A Frequência da Revelação',
              significado:
                'O 11 em siddhi é a PRESENÇA DE MALKUTH — a reinação do reino. Não é mais intuição como dom — é intuição como natureza. O 11 em siddhi é o canal puro.',
              padrao:
                'Em siddhi, o 11 não vê mais. O 11 É a visão. The separation between the seer and the seen dissolves. You become the eye itself — not the one who looks, but the act of looking made visible. This is the frequency of the prophet, the visionary who no longer struggles to see because vision and being have become one.',
              aplicacao: {
                proposito:
                  'Your purpose is to BE the vision — not to have it, not to share it, but to be it.',
                carreira: 'Your work becomes revelation made form.',
                relacionamentos:
                  'In love, you are the mirror that shows others their own highest vision of themselves.',
                espiritualidade:
                  'You are the bridge itself — not the one who crosses, but the crossing.',
                saude: 'The body is luminous, energized by the flow of vision through it.',
              },
              afirmacao: 'Eu sou a visão — e o que eu sou, o mundo ainda está descobrindo.',
            },
          },
        },
        22: {
          arquetipoAkasha: 'O Mestre Construtor',
          mandato:
            'Você existe para construir o que outros consideram impossível — não porque você é mais capaz, mas porque você é o único que se recusa a aceitar o limite como real.',
          levels: {
            shadow: {
              tituloPool: 'O Peso da Obra-Prima',
              significado:
                'O 22 é o MASTER NUMBER DA OBRA-PRIMA — a capacidade de manifestar o maior sonho em forma concreta. Em sombra, esse potencial se torna o MONSTRO DO PERFECCIONISMO: o projeto perfeito que nunca sai do papel.',
              padrao:
                'Seu padrão em sombra é a PARALISIA DO POSSÍVEL. Você carrega uma visão tão grande que qualquer implementation parece inadequada. A origem: provavelmente uma infância onde você era cobrado por perfection e onde "suficientemente bom" nunca era o bastante. Adulto, você ou não começa (porque vai sair errado) ou começa e não termina (porque nunca está bom o suficiente). O resultado: você sabe que pode fazer algo extraordinário — e esse conhecimento pesa mais do que a incapacidade de agir.',
              aplicacao: {
                proposito:
                  'No propósito, você tem a capacidade mas não a coragem — a gap entre visão e ação é o seu maior inimigo.',
                carreira:
                  'Na carreira, você ou está em algo pequeno (e se frustra) ou não está em nada (porque nada é grand o suficiente).',
                financas:
                  'Finanças reflete o padrão: oportunidades são recusadas porque "não são grand o suficiente" — e o seguro é acumulado.',
                relacionamentos:
                  'No amor, você pode ter um padrão ideal que ninguém alcana — e acaba sozinho esperando a pessoa perfeita.',
                saude:
                  'O corpo do 22 em sombra é tense, com problemas de agotamiento, stress crónico.',
              },
              acaoPratica: {
                amplificar: [
                  'Escolha um projeto pequeno e termine — qualquer um. A lição não está no projeto, está em terminar.',
                  'Quando a urge de fazer "grander" aparecer, pergunte: isso é elevação ou procrastinação?',
                  'Pratique "feito é melhor que perfeito" em uma coisa física esta semana',
                ],
                evitar: [
                  'Começar mais um projeto quando os anteriores não foram terminados',
                  'Confundir "não está bom o suficiente" com "não está pronto"',
                  'Usar a escala do projeto como desculpa para não começar',
                ],
                ritual:
                  'Defina "pronto" antes de começar — não como "perfeito", mas como "bom o suficiente para ser lançado". E cumpra.',
              },
              afirmacao:
                'Eu construo com excelência e sei que "pronto" é um ponto no caminho, não o fim.',
            },
            gift: {
              tituloPool: 'O Dom de Construir em Grande Escala',
              significado:
                'O 22 em dom é a CAPACIDADE DE CONSTRUIR O IMPOSSÍVEL. Você não escolhe entre sonhar grande e agir pequeno — você faz as duas coisas simultaneamente. O dom do 22 é a VISÃO ESTRATÉGICA.',
              padrao:
                'Seu dom é a ARQUITETURA DO LEGADO. Você consegue olhar para um caos e ver a estrutura que ele pode virar — e depois construir essa estrutura. Isso é raro: a maioria das pessoas ou é estratégica ou é visionária. O 22 em dom é as duas coisas. A diferença é que o 22 em dom sabe que o legado não é o building — é o que as pessoas Fazem com ele depois.',
              aplicacao: {
                proposito:
                  'Seu propósito é construir estruturas que duram — não monuments a você, mas fundações para outros.',
                carreira:
                  'Na carreira, você é o fundador, o arquiteto, o estrategista. Você olha para o sistema e vê como ele pode ser 10x melhor.',
                financas:
                  'Finanças refletem o dom: o 22 em dom constrói riqueza em escala porque não se limita ao que é seguro.',
                relacionamentos:
                  'No amor, você é o parceiro que constrói uma vida — não um relacionamento, mas uma VIDA compartilhada.',
                saude:
                  'O corpo do 22 em dom é fuerte e resistente — a estrutura física reflete a capacidade de construir.',
              },
              acaoPratica: {
                amplificar: [
                  'Defina uma visão grande esta semana — e depois divida em 3 passos imediatos',
                  'Quando o projeto parecer grande demais, pergunte: qual é o primeiro tijolo?',
                  'Colabore — o 22 em dom é mais poderoso em equipe do que sozinho',
                ],
                evitar: [
                  'Tentar construir sozinho quando a colaboração amplificaria',
                  'Confundir "escala" com "complicação"',
                  'Perfeccionar a visão sem nunca avançar para a construção',
                ],
                ritual:
                  'Escreva a visão do que você quer construir — qualquer área. Feito isso, escreva apenas o PRÓXIMO PASSO. Não o plano inteiro.',
              },
              afirmacao:
                'Eu construo em grande escala com os pés na terra — e cada tijolo importa.',
            },
            siddhi: {
              tituloPool: 'A Frequência da Forma Divina',
              significado:
                'O 22 em siddhi é a PRESENÇA DE DAAT — o conhecimento secreto, donde a forma e o espírito se encontram. Não é mais construção como esforço — é construção como emanation.',
              padrao:
                'Em siddhi, o 22 não constrói mais. O 22 É a construção. You become the living proof that the impossible is merely a limitation in the mind of the small self. Your very presence demonstrates that great things are built not by force but by alignment — that the master builder is one who has surrendered to the pattern that wants to manifest.',
              aplicacao: {
                proposito:
                  'Your purpose is to BE the constructed form through which life expresses its greatness.',
                carreira: 'Your work becomes a living architecture that serves generations.',
                financas: 'Wealth flows through you as through a perfectly designed system.',
                relacionamentos:
                  'In love, you build with — not for — your partner. The relationship itself is the construction.',
                saude:
                  'The body becomes a perfect vessel for the work — strong, enduring, radiant.',
              },
              afirmacao: 'Eu sou a construção sagrada — e cada forma que habito é sagrada.',
            },
          },
        },
        33: {
          arquetipoAkasha: 'O Mestre Servidor',
          mandato:
            'Você existe para lembrar o mundo de que ensinar não é dar respostas — é criar as condições para que outros encontrem as suas.',
          levels: {
            shadow: {
              tituloPool: 'O Fogo que Queima o Servidor',
              significado:
                'O 33 é o MASTER NUMBER DO ENSINO — a frequência mais alta da numerologia. Em sombra, esse potencial se torna o MARTÍRIO: o serviço se torna auto-sacrifício, o ensino se torna proselitismo, o amor divino se torna culpa.',
              padrao:
                'Seu padrão em sombra é a CONFUSÃO ENTRE SERVIÇO E AUTOSSABOTAGEM. Você se cobra por não estar fazendo "o suficiente" — e a distância entre o que você faz e o que você acha que deveria fazer se torna insuportável. A origem: provavelmente uma infância onde você era a "luz da família" — o que sustentava o emocional dos adultos. Adulto, você replicates esse padrão em todo lugar: se cobra por carregar os outros e depois se resentir de carregar os outros. O resultado: você dá demais, se burnout, e depois se culpa por ter se burnout.',
              aplicacao: {
                proposito:
                  'No propósito, o 33 em sombra se perde: ou vira guru sem chão ou vira assistente sem fim. Em ambos, o EU se dissolve.',
                carreira:
                  'Na carreira, você ou está em uma função de serviço (e se frustra de não ser reconhecido) ou não consegue escolher carreira (porque todas parecem "egoístas demais").',
                relacionamentos:
                  'No amor, você é o que dá tudo — e se ressente de quem recebe sem oferecer o mesmo. Mas nunca pediu.',
                saude:
                  'O corpo do 33 em sombra é agotado cronicamente, com padrão de burnout recorrente.',
              },
              acaoPratica: {
                amplificar: [
                  'Defina um limite de serviço esta semana — e cumpra. Não mais, não menos.',
                  'Quando se sentir responsável pelo bem-estar do outro, pergunte: isso é meu ou é escolha minha?',
                  'Pratique descansar sem culpa — o mundo não depende de você em todos os momentos',
                ],
                evitar: [
                  'Confundir "ser necessário" com "ser insubstituível"',
                  'Usar serviço para evitar a própria vida',
                  'OcupAR o espaço que os outros precisam para crecer',
                ],
                ritual:
                  'Escreva tudo o que você faz por outros que não é genuinamente oferecido — e depois escolha um para parar.',
              },
              afirmacao:
                'Eu sirvo com sabedoria e sei que meu valor não depende do quanto eu entrego.',
            },
            gift: {
              tituloPool: 'O Dom de Elevar Através do Exemplo',
              significado:
                'O 33 em dom é a CAPACIDADE DE ENSINAR ATRAVÉS DO SER. Você não ensina com palavras — você ensina com presença. O dom do 33 é a PRESENÇA EDUCADORA.',
              padrao:
                'Seu dom é a TRANSMISSÃO POR IRRADIAÇÃO. Você não precisa estar na frente de uma sala — sua mera presença eleva o padrão de consciência ao seu redor. Isso é raro: a maioria ensina pelo que sabe; o 33 em dom ensina pelo que É. A diferença é que o que o 33 ensina não pode ser desaprendido — porque não foi informação, foi impressão.',
              aplicacao: {
                proposito:
                  'Seu propósito é ser o catalisador de transformação — não o agente, mas o catalisador. others change by your presence, not by your instruction.',
                carreira:
                  'Na carreira, você brilha em ensino, mentoria, liderança espiritual. Sua presença no ambiente muda a dinâmica de todos.',
                espiritualidade:
                  'Na espiritualidade, você é o mestre que não precisa ser seguido — porque seguindo a própria vida, você já ensina.',
                relacionamentos:
                  'No amor, você traz uma frequência de elevação — parceiros se tornam mais de si mesmos na sua presença.',
                saude:
                  'O corpo do 33 em dom é luminoso, energizado pela qualidade do que transmite.',
              },
              acaoPratica: {
                amplificar: [
                  'Ensine algo esta semana — não um tema, uma experiência',
                  'Permita que os outros aprendam com seus erros sem se proteger',
                  'Pratique estar presente em vez de estar ensinando',
                ],
                evitar: [
                  'Confundir ensinar com ditar',
                  'Colocar-se no pedestal do guru',
                  'Usar "eu sei mais" como barreira de conexão',
                ],
                ritual:
                  'Escolha uma pessoa que você quer elevar — e em vez de dar conselhos, simplesmente esteja presente com ela esta semana.',
              },
              afirmacao:
                'Eu ensino com minha presença e honro o direito dos outros de aprender à sua maneira.',
            },
            siddhi: {
              tituloPool: 'A Frequência do Amor Incondicional',
              significado:
                'O 33 em siddhi é a PRESENÇA DE KETHER — a primeira sefirá, a coroa, donde o amor se torna pura luz. É a frequência mais rara da numerologia.',
              padrao:
                'Em siddhi, o 33 não ensina mais. O 33 É o ensino. You become the living expression of the highest frequency accessible to human consciousness — unconditional love made visible. This is the frequency of the awakened master, the one whose very presence transforms without effort. There is no longer a teacher and a student — only life recognizing itself through different forms.',
              aplicacao: {
                proposito:
                  'Your purpose is to BE love — not to give it, not to teach it, but to be it.',
                carreira: 'Your work is indistinguishable from prayer.',
                espiritualidade: 'You are the teachings — embodied, not written.',
                relacionamentos:
                  'In love, you are the one whose presence allows others to remember who they truly are.',
                saude:
                  'The body becomes light — luminous, unburdened, serving as a perfect conduit for the highest frequency.',
              },
              afirmacao:
                'Eu sou o amor — e ele flui através de mim sem que eu precise fazer nada além de estar presente.',
            },
          },
        },
      };
    function a_(e, a, o, r) {
      let t,
        i = o.levels[r];
      return {
        ...((t = a ? ` (Master ${e})` : ''),
        { nivel: r, codigo: `vida-${e}-${r}`, dado: `Seu N\xfamero de Vida \xe9 ${e}${t}.` }),
        tituloPool: i.tituloPool,
        significado: i.significado,
        padrao: i.padrao,
        aplicacao: i.aplicacao,
        area: 'proposito',
        afirmacao: i.afirmacao,
      };
    }
    function aq(e, a) {
      return {
        area: 'proposito',
        nivel: a,
        codigo: `vida-${e}-${a}`,
        tituloPool: {
          shadow: 'O Desafio do Número',
          gift: 'O Dom do Número',
          siddhi: 'A Frequência do Número',
        }[a],
        dado: `Seu N\xfamero de Vida \xe9 ${e}.`,
        significado: `O n\xfamero ${e} carrega uma energia \xfanica que convida voc\xea a uma jornada de autoconhecimento. A interpreta\xe7\xe3o espec\xedfica para este n\xfamero ainda est\xe1 sendo desenvolvida — enquanto isso, as energias gerais do n\xfamero ${e} se aplicam.`,
        padrao: `Com o N\xfamero de Vida ${e}, voc\xea est\xe1 em um caminho de descoberta. A interpreta\xe7\xe3o profunda deste n\xfamero ser\xe1 liberada em breve. Enquanto isso, as qualidades gerais de ${e} — sua energia fundamental — convidam voc\xea a observar como este n\xfamero se manifesta na sua vida.`,
        aplicacao: {
          proposito: `Observe como a energia do ${e} se manifesta no seu dia a dia. Onde voc\xea sente que ${e} \xe9 um recurso? Onde ele \xe9 um desafio?`,
        },
        afirmacao: `Eu estou descobrindo o significado profundo do meu n\xfamero de vida ${e}.`,
      };
    }
    let ax = [
        'proposito',
        'carreira',
        'financas',
        'saude',
        'relacionamentos',
        'sexualidade',
        'espiritualidade',
      ],
      aO = {
        shadow: { titulo: 'Sombra', cor: '#c084fc', emoji: '◐' },
        gift: { titulo: 'Dom', cor: '#fbbf24', emoji: '◈' },
        siddhi: { titulo: 'Siddhi', cor: '#34d399', emoji: '◉' },
      },
      aA = {
        shadow: 'O desafio — o padrão que se repete inconscientemente',
        gift: 'O presente — a qualidade que você irradia quando em plenitude',
        siddhi: 'A frequência — o estado onde o número e o ser são um',
      };
    e.s(
      [
        'AkashaSignificadoCard',
        0,
        function ({ lifePath: e, defaultNivel: a = 'gift' }) {
          let [o, r] = (0, c.useState)(a),
            [t, i] = (0, c.useState)('proposito'),
            s = (function (e) {
              let a = ay.has(e);
              if (!ab[e])
                return {
                  numero: e,
                  isMaster: !1,
                  levels: { shadow: aq(e, 'shadow'), gift: aq(e, 'gift'), siddhi: aq(e, 'siddhi') },
                  mandato: `Seu N\xfamero de Vida \xe9 ${e}. Este n\xfamero carrega uma energia \xfanica que convida voc\xea a descobrir seu significado atrav\xe9s da experi\xeancia.`,
                  arquetipoAkasha: `N\xfamero ${e}`,
                };
              let o = ab[e];
              return {
                numero: e,
                isMaster: a,
                levels: {
                  shadow: a_(e, a, o, 'shadow'),
                  gift: a_(e, a, o, 'gift'),
                  siddhi: a_(e, a, o, 'siddhi'),
                },
                mandato: o.mandato,
                arquetipoAkasha: o.arquetipoAkasha,
              };
            })(e),
            n = s.levels[o] ?? s.levels.gift;
          return (0, u.jsxs)('section', {
            style: {
              background: 'rgba(124,92,255,0.07)',
              border: '1px solid rgba(124,92,255,0.25)',
              borderLeft: '3px solid #7c5cff',
              borderRadius: 16,
              padding: 'clamp(1rem, 4vw, 1.5rem) clamp(0.875rem, 3vw, 1.4rem)',
              marginBottom: 24,
              maxWidth: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden',
            },
            children: [
              (0, u.jsxs)('div', {
                style: { marginBottom: 16 },
                children: [
                  (0, u.jsxs)('div', {
                    style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 },
                    children: [
                      (0, u.jsx)('span', { style: { fontSize: '1rem' }, children: '✦' }),
                      (0, u.jsx)('span', {
                        style: {
                          fontFamily: 'var(--font-cinzel, serif)',
                          fontSize: '0.7rem',
                          color: '#7c5cff',
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                        },
                        children: 'Akasha',
                      }),
                    ],
                  }),
                  (0, u.jsx)('h2', {
                    style: {
                      fontFamily: 'var(--font-cinzel, serif)',
                      fontSize: '1.2rem',
                      color: '#e2e0f0',
                      margin: '0 0 4px',
                      lineHeight: 1.2,
                    },
                    children: s.arquetipoAkasha,
                  }),
                  (0, u.jsx)('p', {
                    style: {
                      fontSize: '0.85rem',
                      color: '#a09cb8',
                      margin: 0,
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                    },
                    children: s.mandato,
                  }),
                ],
              }),
              (0, u.jsx)('div', {
                style: { marginBottom: 12 },
                children: (0, u.jsx)('span', {
                  style: { fontSize: '0.68rem', color: '#6b6480', letterSpacing: '0.04em' },
                  children: 'Inspirado em Gene Keys (Richard Rudd)',
                }),
              }),
              (0, u.jsx)('div', {
                style: {
                  display: 'flex',
                  gap: 6,
                  marginBottom: 16,
                  background: 'rgba(0,0,0,0.25)',
                  borderRadius: 10,
                  padding: 4,
                },
                children: ['shadow', 'gift', 'siddhi'].map((e) =>
                  (0, u.jsxs)(
                    'button',
                    {
                      onClick: () => r(e),
                      style: {
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-cinzel, serif)',
                        letterSpacing: '0.06em',
                        background:
                          o === e
                            ? `rgba(${'shadow' === e ? '124,92,255' : 'gift' === e ? '251,191,36' : '52,211,153'},0.2)`
                            : 'transparent',
                        color: o === e ? aO[e].cor : '#706686',
                        borderBottom: o === e ? `2px solid ${aO[e].cor}` : '2px solid transparent',
                        transition: 'all 0.2s ease',
                      },
                      children: [aO[e].emoji, ' ', aO[e].titulo],
                    },
                    e
                  )
                ),
              }),
              (0, u.jsx)('p', {
                style: {
                  fontSize: '0.72rem',
                  color: aO[o].cor,
                  margin: '0 0 10px',
                  letterSpacing: '0.04em',
                },
                children: aA[o],
              }),
              n.aplicacao &&
                Object.keys(n.aplicacao).length > 0 &&
                (0, u.jsx)('div', {
                  style: { marginBottom: 14 },
                  children: (0, u.jsx)('div', {
                    style: { display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 },
                    children: ax.map((e) =>
                      n.aplicacao[e]
                        ? (0, u.jsx)(
                            'button',
                            {
                              onClick: () => i(e),
                              style: {
                                padding: '4px 10px',
                                borderRadius: 20,
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.68rem',
                                fontFamily: 'var(--font-cinzel, serif)',
                                letterSpacing: '0.04em',
                                background: t === e ? `${aO[o].cor}22` : 'rgba(255,255,255,0.06)',
                                color: t === e ? aO[o].cor : '#706686',
                                borderBottom:
                                  t === e ? `1.5px solid ${aO[o].cor}` : '1.5px solid transparent',
                                transition: 'all 0.15s ease',
                              },
                              children:
                                'proposito' === e
                                  ? '✦ Propósito'
                                  : 'carreira' === e
                                    ? '◈ Carreira'
                                    : 'financas' === e
                                      ? '◉ Finanças'
                                      : 'saude' === e
                                        ? '◐ Saúde'
                                        : 'relacionamentos' === e
                                          ? '◑ Relacionamentos'
                                          : 'sexualidade' === e
                                            ? '✧ Sexualidade'
                                            : 'espiritualidade' === e
                                              ? '✦ Espiritualidade'
                                              : e,
                            },
                            e
                          )
                        : null
                    ),
                  }),
                }),
              (0, u.jsx)('div', {
                style: { marginBottom: 14 },
                children: (0, u.jsx)('p', {
                  style: { fontSize: '0.88rem', color: '#c8c3dc', lineHeight: 1.65, margin: 0 },
                  children: n.significado,
                }),
              }),
              n.aplicacao &&
                n.aplicacao[t] &&
                (0, u.jsxs)('div', {
                  style: {
                    background: `linear-gradient(135deg, ${aO[o].cor}10, ${aO[o].cor}05)`,
                    border: `1px solid ${aO[o].cor}30`,
                    borderRadius: 10,
                    padding: '0.9rem 1rem',
                    marginBottom: 14,
                  },
                  children: [
                    (0, u.jsx)('p', {
                      style: {
                        fontSize: '0.68rem',
                        color: aO[o].cor,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        margin: '0 0 8px',
                        fontWeight: 600,
                      },
                      children:
                        'proposito' === t
                          ? '✦ No seu Propósito'
                          : 'carreira' === t
                            ? '◈ Na Carreira e Vocação'
                            : 'financas' === t
                              ? '◉ Nas Finanças e Prosperidade'
                              : 'saude' === t
                                ? '◐ Na Saúde e Corpo'
                                : 'relacionamentos' === t
                                  ? '◑ Nos Relacionamentos'
                                  : 'sexualidade' === t
                                    ? '✧ Na Sexualidade'
                                    : 'espiritualidade' === t
                                      ? '✦ Na Espiritualidade'
                                      : '◑ Nos Relacionamentos',
                    }),
                    (0, u.jsx)('p', {
                      style: { fontSize: '0.82rem', color: '#c8c3dc', lineHeight: 1.65, margin: 0 },
                      children: n.aplicacao[t],
                    }),
                  ],
                }),
              (0, u.jsxs)('div', {
                style: {
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 10,
                  padding: '0.9rem 1rem',
                  marginBottom: 14,
                  borderLeft: `2px solid ${aO[o].cor}44`,
                },
                children: [
                  (0, u.jsx)('p', {
                    style: {
                      fontSize: '0.72rem',
                      color: aO[o].cor,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      margin: '0 0 6px',
                      fontWeight: 600,
                    },
                    children: 'O seu padrão',
                  }),
                  (0, u.jsx)('p', {
                    style: { fontSize: '0.85rem', color: '#b8b3cc', lineHeight: 1.6, margin: 0 },
                    children: n.padrao,
                  }),
                ],
              }),
              n.acaoPratica &&
                (0, u.jsxs)('div', {
                  style: { marginBottom: 14 },
                  children: [
                    (0, u.jsx)('p', {
                      style: {
                        fontSize: '0.72rem',
                        color: '#9b93b8',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        margin: '0 0 8px',
                        fontWeight: 600,
                      },
                      children: 'Prática esta semana',
                    }),
                    n.acaoPratica.amplificar.length > 0 &&
                      (0, u.jsxs)('div', {
                        style: { marginBottom: 8 },
                        children: [
                          (0, u.jsx)('span', {
                            style: {
                              fontSize: '0.72rem',
                              color: '#4ade80',
                              fontWeight: 600,
                              display: 'block',
                              marginBottom: 4,
                            },
                            children: 'Amplifique',
                          }),
                          n.acaoPratica.amplificar.map((e, a) =>
                            (0, u.jsxs)(
                              'p',
                              {
                                style: {
                                  fontSize: '0.82rem',
                                  color: '#a8a3bc',
                                  lineHeight: 1.5,
                                  margin: '2px 0',
                                  paddingLeft: 12,
                                },
                                children: ['→ ', e],
                              },
                              a
                            )
                          ),
                        ],
                      }),
                    n.acaoPratica.evitar.length > 0 &&
                      (0, u.jsxs)('div', {
                        style: { marginBottom: 8 },
                        children: [
                          (0, u.jsx)('span', {
                            style: {
                              fontSize: '0.72rem',
                              color: '#f87171',
                              fontWeight: 600,
                              display: 'block',
                              marginBottom: 4,
                            },
                            children: 'Evite',
                          }),
                          n.acaoPratica.evitar.map((e, a) =>
                            (0, u.jsxs)(
                              'p',
                              {
                                style: {
                                  fontSize: '0.82rem',
                                  color: '#a8a3bc',
                                  lineHeight: 1.5,
                                  margin: '2px 0',
                                  paddingLeft: 12,
                                },
                                children: ['✕ ', e],
                              },
                              a
                            )
                          ),
                        ],
                      }),
                    n.acaoPratica.ritual &&
                      (0, u.jsxs)('div', {
                        style: {
                          background: 'rgba(124,92,255,0.08)',
                          borderRadius: 8,
                          padding: '0.7rem 0.9rem',
                          marginTop: 6,
                        },
                        children: [
                          (0, u.jsx)('span', {
                            style: {
                              fontSize: '0.72rem',
                              color: '#7c5cff',
                              fontWeight: 600,
                              display: 'block',
                              marginBottom: 4,
                            },
                            children: 'Ritual mínimo',
                          }),
                          (0, u.jsx)('p', {
                            style: {
                              fontSize: '0.82rem',
                              color: '#b8b3cc',
                              lineHeight: 1.5,
                              margin: 0,
                              fontStyle: 'italic',
                            },
                            children: n.acaoPratica.ritual,
                          }),
                        ],
                      }),
                  ],
                }),
              n.afirmacao &&
                (0, u.jsxs)('div', {
                  style: {
                    background: `linear-gradient(135deg, ${aO[o].cor}12, ${aO[o].cor}06)`,
                    borderRadius: 10,
                    padding: '0.9rem 1rem',
                    borderLeft: `3px solid ${aO[o].cor}`,
                  },
                  children: [
                    (0, u.jsx)('p', {
                      style: {
                        fontSize: '0.72rem',
                        color: aO[o].cor,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        margin: '0 0 6px',
                        fontWeight: 600,
                      },
                      children: 'Afirmação',
                    }),
                    (0, u.jsxs)('p', {
                      style: {
                        fontSize: '0.88rem',
                        color: '#d4d0e8',
                        lineHeight: 1.55,
                        margin: 0,
                        fontStyle: 'italic',
                      },
                      children: ['“', n.afirmacao, '”'],
                    }),
                  ],
                }),
            ],
          });
        },
      ],
      98306
    );
  },
]);
